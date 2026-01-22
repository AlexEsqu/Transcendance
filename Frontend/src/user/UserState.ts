import { RegisteredUser, GuestUser, User, BaseUser } from "./User";
import { router } from "../app";
import { EmailAuthService } from "../auth/EmailAuth";
import { OAuthService } from "../auth/OAuth";
import { GuestService } from "../auth/Guest";
import { TwoFactorAuthService } from "../auth/TwoFactorAuth";
import { CustomizeService } from "./Customize";
import { SocialService } from "./Social";

const apiKey : string = import.meta.env.VITE_APP_SECRET_KEY ?? "";
const apiDomainName : string = import.meta.env.VITE_API_DOMAIN_NAME ?? "";

export type { Subscriber }
export { UserState, apiKey, apiDomainName }

type Subscriber = (user: User | null) => void;

const localStorageKeyForGuestUser : string = "PongGuestUser"
const localStorageKeyForRegisteredUser : string = "PongRegisteredUser"

// wrapping the User element in a observer class with singleton
class UserState
{

	//--------------------------- ATTRIBUTES -------------------------------//

	// user object containing the data
	private user: User | null = null;

	// list of elements which need to be notified if user state changes
	subscriberVector: Subscriber[] = [];

	// singleton of the class object, to only ever get one user active
	private static instance: UserState;

	// sub services (to subdivide the class and look neater)
	emailAuth: EmailAuthService;
	oAuth: OAuthService;
	guest: GuestService;
	twoFactor: TwoFactorAuthService;
	customize: CustomizeService;
	social: SocialService;

	//--------------------------- CONSTRUCTORS ------------------------------//

	// singleton constructor is private
	private constructor()
	{
		this.emailAuth = new EmailAuthService(apiDomainName, apiKey, this);
		this.oAuth = new OAuthService(apiDomainName, apiKey, this);
		this.guest = new GuestService(this);
		this.twoFactor = new TwoFactorAuthService(this);
		this.customize = new CustomizeService(this);
		this.social = new SocialService(this);

		this.loadFromLocalStorage();
	}

	//---------------------------- GETTER -----------------------------------//

	static getInstance(): UserState
	{
		if (!UserState.instance)
			UserState.instance = new UserState();

		return UserState.instance;
	}

	getUser(): User | null
	{
		return this.user;
	}

	//--------------------------- SETTER ------------------------------------//

	// modified User objects and notifies subscribers for state changes
	async setUser(newUser: User | null): Promise<void>
	{
		this.user = newUser;

		// wait for the backend to confirm data on the user
		if (newUser instanceof RegisteredUser)
			await this.refreshUser();

		this.saveToLocalStorage();
		this.notifySubscribers();
	}

	//----------------------- OBSERVER PATTERN ------------------------------//

	// callback is the function that will be called when an event is notified
	subscribe(callback: Subscriber): void
	{
		this.subscriberVector.push(callback);
		callback(this.user);
	}

	unsubscribe(callback: Subscriber): void
	{
		this.subscriberVector = this.subscriberVector.filter
		(
			subscriber => subscriber !== callback
		);
	}

	notifySubscribers(): void
	{
		this.subscriberVector.forEach(callback => callback(this.user));
	}

	//--------------------------- STORAGE ----------------------------------//

	saveToLocalStorage(): void
	{
		// clearing out any possible remaining User object from local
		localStorage.removeItem(localStorageKeyForGuestUser);
		localStorage.removeItem(localStorageKeyForRegisteredUser);

		if (!this.user)
			return;

		if (this.user instanceof RegisteredUser)
		{
			localStorage.setItem(localStorageKeyForRegisteredUser, JSON.stringify(
				{
					username: this.user.username,
					id: this.user.id,
					accessToken: this.user.accessToken,
					avatar: this.user.avatar,
					friends: this.user.friends,
					email: this.user.email
				}
			));
		}
		else if (this.user instanceof GuestUser)
		{
			localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify(
				{
					username: this.user.username,
					avatar: this.user.avatar
				}
			));
		}
	}

	async loadFromLocalStorage(): Promise<void>
	{
		const registeredData = localStorage.getItem(localStorageKeyForRegisteredUser);
		const guestData = localStorage.getItem(localStorageKeyForGuestUser);
		localStorage.removeItem(localStorageKeyForGuestUser);
		localStorage.removeItem(localStorageKeyForRegisteredUser);

		if (registeredData)
		{
			try
			{
				const data = JSON.parse(registeredData);
				this.user = new RegisteredUser(data.id, data.accessToken, data.username);
				this.user.avatar = data.avatar;
				this.user.friends = data.friends ?? [];
				this.user.email = data.email ?? 'not set';
				await this.refreshUser();
				this.notifySubscribers();
			}
			catch (error)
			{
				const msg = error instanceof Error
					? error.message
					: "Unknown error when loading user from local storage";
				console.log(msg);
				this.resetUser();
			}
		}
		else if (guestData)
		{
			const data = JSON.parse(guestData);
			const user = new GuestUser(data.username);
			user.avatar = data.avatar;
			this.setUser(user);
		}
	}

	//------------------------ TOKEN REFRESHER -------------------------------//

	async refreshToken(): Promise<boolean>
	{
		if (!(this.user instanceof RegisteredUser))
			return false;

		const response = await fetch(
			`${apiDomainName}/users/auth/refresh`,
			{
				method: 'POST',
				headers:
				{
					'accept': 'application/json',
					'Authorization': `Bearer ${this.user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
			}
		);
		const data = await response.json();

		if (!response.ok || !data.accessToken)
		{
			console.log(data.message || data.error || 'Faied to refresh token');
			this.resetUser();
			return false;
		}

		this.user.accessToken = data.accessToken;
		this.saveToLocalStorage();
		return true;
	}

	async fetchWithTokenRefresh(requestURL: RequestInfo, requestContent: RequestInit = {}): Promise<Response>
	{
		if (!(this.user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		// Typescript annoyance to be able to update the incoming request header with new token
		let headers: Record<string, string> =
		{
			'accept': 'application/json',
			...(typeof requestContent.headers === 'object'
				&& !Array.isArray(requestContent.headers)
				&& !(requestContent.headers instanceof Headers)
				? requestContent.headers as Record<string, string>
				: {})
		};
		requestContent.headers = headers;

		let response = await fetch(requestURL, requestContent);

		if (response.status === 401)
		{
			const refreshed = await this.refreshToken();
			if (refreshed)
			{
				headers['Authorization'] = `Bearer ${this.user.accessToken}`;
				requestContent.headers = headers;
				response = await fetch(requestURL, requestContent);
			}
			else
				throw new Error("Failed to refresh token");
		}

		return response;
	}

	//------------------------ REFRESH FROM BACKEND -------------------------------//

	async refreshUser(): Promise<void>
	{
		if (!(this.user instanceof RegisteredUser))
		{
			console.log("No registered user to refresh");
			return;
		}

		if (this.user.id === null || this.user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.fetchWithTokenRefresh(
			`${apiDomainName}/users/me`,
			{
				method: 'GET',
				headers:
				{
					'accept': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${this.user.accessToken}`
				}
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user (${response.status})`);

		this.user.username = data.username ?? this.user.username;
		this.user.avatar = data.avatar ?? this.user.avatar;
		this.user.email = data.email ?? this.user.email;

		await this.refreshFriendList(this.user);
		await this.refreshHas2fa(this.user);
		this.user.isRefreshed = true;

		this.saveToLocalStorage();
	}

	async refreshFriendList(user : RegisteredUser)
	{
		if (user.id === null || user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/friends`,
			{
				method: 'GET',
				headers:
				{
					'accept': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${user.accessToken}`
				}
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user friends (${response.status})`);

		user.setFriends(data);
	}

	async refreshHas2fa(user : RegisteredUser)
	{
		const response = await this.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/2fa`,
			{
				method: 'GET',
				headers:
				{
					'accept': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${user.accessToken}`
				}
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch tfa status (${response.status})`);

		user.hasTwoFactorAuth = data.is_2fa_enabled;
	}

	async logout()
	{
		const user = this.getUser();

		if (user instanceof RegisteredUser)
			await this.emailAuth.logout();
		else
			this.guest.guestout();
	}

	resetUser(): void
	{
		this.user = null;

		localStorage.removeItem(localStorageKeyForGuestUser);
		localStorage.removeItem(localStorageKeyForRegisteredUser);

		this.notifySubscribers();

		router.navigateTo('/connection');
	}
}
