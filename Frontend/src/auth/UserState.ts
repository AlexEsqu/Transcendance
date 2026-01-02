import { RegisteredUser, GuestUser, User, BaseUser } from "../users/User";
import { router } from "../app";

const apiKey : string = import.meta.env.VITE_APP_SECRET_KEY ?? "";
const jwtKey : string = import.meta.env.VITE_JWT_SECRET ?? "";
const apiDomainName : string = import.meta.env.VITE_API_DOMAIN_NAME ?? "";
console.log(apiKey);
console.log(jwtKey);
console.log(apiDomainName);

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
	private subscriberVector: Subscriber[] = [];

	// singleton of the class object, to only ever get one user active
	private static instance: UserState;

	//--------------------------- CONSTRUCTORS ------------------------------//

	// singleton constructor is private
	private constructor()
	{
		this.loadFromLocalStorage();
	}

	//---------------------------- GETTER -----------------------------------//

	public static getInstance(): UserState
	{
		if (!UserState.instance)
			UserState.instance = new UserState();

		return UserState.instance;
	}

	public getUser(): User | null
	{
		return this.user;
	}

	//--------------------------- SETTER ------------------------------------//

	// modified User objects and notifies subscribers for state changes
	public setUser(newUser: User | null): void
	{
		this.user = newUser;
		this.saveToLocalStorage();
		this.notifySubscribers();
	}

	//----------------------- OBSERVER PATTERN ------------------------------//

	// callback is the function that will be called when an event is notified
	public subscribe(callback: Subscriber): void
	{
		this.subscriberVector.push(callback);
		callback(this.user);
	}

	public unsubscribe(callback: Subscriber): void
	{
		this.subscriberVector = this.subscriberVector.filter
		(
			subscriber => subscriber !== callback
		);
	}

	private notifySubscribers(): void
	{
		this.subscriberVector.forEach(callback => callback(this.user));
	}

	//--------------------------- STORAGE ----------------------------------//

	private saveToLocalStorage(): void
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
					friends: this.user.friends
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

	private loadFromLocalStorage(): void
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
				this.user = new RegisteredUser(data.username, data.id, data.accessToken);
				this.user.avatar = data.avatar;
				this.user.friends = data.friends ?? [];
				this.notifySubscribers();
				this.refreshUser();
			}
			catch (error)
			{
				const msg = error instanceof Error
					? error.message
					: "Unknown error when loading user from local storage";
				console.log(msg);
				this.setUser(null);
			}
		}
		else if (guestData)
		{
			const data = JSON.parse(guestData);
			const user = new GuestUser(data.username);
			user.avatar = data.avatar;
			this.setUser(user);
		}
		console.log(this.user);
	}



	//------------------------ AUTHENTICATION -------------------------------//

	public loginAsGuest(username: string): void
	{
		const guestUser = new GuestUser(username);
		this.setUser(guestUser);
	}

	public async loginAsRegistered(login: string, password: string): Promise<void>
	{
		const response = await fetch(`${apiDomainName}/users/auth/login`,
			{
				method: 'POST',
				headers: {
					'accept': 'application/json',
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(
					{
						login, password
					}
				),
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || 'Login Failed');

		const user = new RegisteredUser(login, data.id, data.accessToken);
		this.setUser(user);
	}

	public async register(username: string, password: string, email: string): Promise<void>
	{
		const response = await fetch(`${apiDomainName}/users/signup`,
			{
				method: 'POST',
				headers: {
					'accept': 'application/json',
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(
					{
						username, password, email
					}
				),
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || 'Register Failed');
	}

	public async logout(): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/auth/logout`,
				{
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`,
						'X-App-Secret': `${apiKey}`
					},
				}
			);

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || data.error || 'Logout Failed');
		}

		this.setUser(null);
	}

	public async deleteAccount(): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me`,
				{
					method: 'DELETE',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`,
						'X-App-Secret': `${apiKey}`
					},
				}
			);

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || data.error || 'Delete account Failed');
		}

		this.setUser(null);
	}

	//------------------------ TOKEN REFRESHER -------------------------------//

	public async refreshToken(): Promise<boolean>
	{
		if (!(this.user instanceof RegisteredUser))
			return false;

		const response = await fetch(`${apiDomainName}/users/auth/refresh`,
		{
			method: 'POST',
			headers:
			{
				'accept': 'application/json',
				'Authorization': `Bearer ${this.user.accessToken}`,
				'X-App-Secret': `${apiKey}`
			},
		});
		const data = await response.json();

		if (!response.ok || !data.accessToken)
		{
			console.log(data.message || data.error || 'Faied to refresh token');
			return false;
		}


		this.user.accessToken = data.accessToken;
		this.saveToLocalStorage();
		return true;
	}

	public async fetchWithTokenRefresh(requestURL: RequestInfo, requestContent: RequestInit = {}): Promise<Response>
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

	//------------------------ METHODS -------------------------------//

	public async rename(newName : string): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me/username`,
			{
				method: 'PUT',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({
					new_username: newName
				})
			});

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || 'Renaming failed');

			this.user.username = newName;
			router.render();
		}

		else if (this.user instanceof GuestUser)
			this.user.username= newName;

		this.setUser(this.user);
	}

	async updateAvatar(formData : FormData): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me/avatar`,
			{
				method: 'PUT',
				headers:
				{
					'accept': 'application/json',
					'Authorization': `Bearer ${this.user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: formData,
			});

			const data = await response.json();
			if (!response.ok)
				throw new Error(`Avatar update failed: ${response.status}, ${data.message}`);

			this.refreshUser();
		}

		else
		{
			throw new Error(`Avatar update failed: Not a registered User`);
		}
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me/password`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.user.accessToken}`,
				},
				body: JSON.stringify({
					oldPassword, newPassword
				})
			});

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || 'Password change failed');

			// no need to set user since password is entirely handled by backend
		}
		else
		{
			throw new Error(`Password update failed: Not a registered User`);
		}
	}

	public async refreshUser(): Promise<void>
	{
		if (!(this.user instanceof RegisteredUser))
		{
			console.log("No registered user to refresh");
			return;
		}

		if (this.user.id === null || this.user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/${this.user.id}`,
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
		console.log(data);
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user (${response.status})`);

		this.user.username = data.username ?? data.username ?? this.user.username;
		this.user.avatar = data.avatar ?? this.user.avatar;

		await this.refreshFriendList();

		this.setUser(this.user);
	}

	public async refreshFriendList()
	{
		if (!(this.user instanceof RegisteredUser))
		{
			console.log("No registered user to refresh");
			return;
		}

		if (this.user.id === null || this.user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me/friends`,
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
		console.log(`received friends as:`);
		console.log(data);
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user friends (${response.status})`);

		this.user.setFriends(data);
	}

	public async addToFriendList(friendId: number)
	{
		if (!(this.user instanceof RegisteredUser))
		{
			console.log("No registered user to refresh");
			return;
		}

		if (this.user.id === null || this.user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.fetchWithTokenRefresh(`${apiDomainName}/users/me/friends`,
			{
				method: 'POST',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${this.user.accessToken}`
				},
				body: JSON.stringify({ id: friendId }),
			}
		);

		const data = await response.json();
		console.log(data);
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user friends (${response.status})`);

		this.refreshFriendList();
	}

}
