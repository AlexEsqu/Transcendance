import { RegisteredUser, GuestUser, User } from "../users/User";
import { router } from "../app"

const apiKey : string = import.meta.env.VITE_APP_SECRET_KEY ?? "";
const jwtKey : string = import.meta.env.VITE_JWT_SECRET ?? "";
console.log(apiKey);
console.log(jwtKey);

export type { Subscriber }
export { UserState }

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
					name: this.user.name,
					id: this.user.id,
					accessToken: this.user.accessToken,
					avatarPath: this.user.avatarPath
				}
			));
		}
		else if (this.user instanceof GuestUser)
		{
			localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify(
				{
					name: this.user.name,
					avatarPath: this.user.avatarPath
				}
			));
		}
	}

	private loadFromLocalStorage(): void
	{
		const registeredData = localStorage.getItem(localStorageKeyForRegisteredUser);
		const guestData = localStorage.getItem(localStorageKeyForGuestUser);

		if (registeredData)
		{
			const data = JSON.parse(registeredData);
			this.user = new RegisteredUser(data.name, data.id, data.accessToken);
			this.user.avatarPath = data.avatarPath;
		}
		else if (guestData)
		{
			const data = JSON.parse(guestData);
			this.user = new GuestUser(data.name);
			this.user.avatarPath = data.avatarPath;
		}

		this.notifySubscribers();

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
		const response = await fetch('http://localhost:3000/users/auth/login',
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
		const response = await fetch('http://localhost:3000/users/signup',
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
			const response = await this.fetchWithTokenRefresh('http://localhost:3000/users/auth/logout',
				{
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`
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
			const response = await this.fetchWithTokenRefresh('http://localhost:3000/users/me',
				{
					method: 'DELETE',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`
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

		const response = await fetch('http://localhost:3000/users/auth/refresh',
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
			console.log(data.message);
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
			const response = await this.fetchWithTokenRefresh('http://localhost:3000/users/me/username',
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

			this.user.name = newName;
			router.render();
		}

		else if (this.user instanceof GuestUser)
			this.user.name= newName;

		this.setUser(this.user);
	}

	async updateAvatar(image : Object): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await this.fetchWithTokenRefresh('http://localhost:3000/users/me/avatar',
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
					'avatar': image
				})
			});

			const data = await response.json();
			if (!response.ok)
				throw new Error(`Avatar update failed: ${response.status}, ${data.message}`);

			this.user.avatarPath = '';
			this.setUser(this.user);
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
			const response = await fetch('http://localhost:3000/users/me/password', {
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

}
