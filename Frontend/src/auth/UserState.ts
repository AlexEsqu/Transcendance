import { RegisteredUser, GuestUser, User } from "../users/User";
import { router } from "../app"

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
			localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify({
				name: this.user.name,
				avatarPath: this.user.avatarPath
			}));
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

	public async loginAsRegistered(username: string, password: string)
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
						username, password
					}
				),
			}
		);

		if (!response.ok)
			throw new Error('Login failed');

		const data = await response.json();
		const user = new RegisteredUser(username, data.id, data.accessToken);
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

		if (!response.ok)
		{
			if (response.status === 409)
				throw new Error('Username already exists');
			throw new Error('Registration failed');
		}

		await this.loginAsRegistered(username, password);
	}

	public async logout(): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await fetch('http://localhost:3000/users/auth/logout',
				{
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`
					},
				}
			);

			if (!response.ok)
				throw new Error('Logout failed');
		}

		this.setUser(null);
	}

	public async deleteAccount(): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			const response = await fetch('http://localhost:3000/users/me',
				{
					method: 'DELETE',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${this.user.accessToken}`
					},
				}
			);

			if (!response.ok)
				throw new Error('Delete failed');
		}

		this.setUser(null);
	}

	//------------------------ METHODS -------------------------------//

	public async rename(newName : string): Promise<void>
	{
		if (this.user instanceof RegisteredUser)
		{
			await this.user.rename(newName)
		}

		if (this.user instanceof GuestUser)
			this.user.rename(newName);

		this.setUser(this.user);
	}

}
