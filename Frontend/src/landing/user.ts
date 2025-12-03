export {User, RegisteredUser, GuestUser, getCurrentUser, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser}

const localStorageKeyForGuestUser : string = "PongGuestUser"
const localStorageKeyForRegisteredUser : string = "PongRegisteredUser"

class User {
	name: string;

	constructor(name: string)
	{
		this.name = name;
	}

	getName(): string
	{
		return this.name;
	}

	logoutUser(): void
	{
	}

}

class RegisteredUser extends User
{
	id: number;
	token: string;

	constructor(name: string, id: number, token: string)
	{
		super(name);
		this.id = id;
		this.token = token;
		localStorage.setItem(localStorageKeyForRegisteredUser, JSON.stringify(this));
	}

	static async createUserFromLogin(username: string, password: string): Promise<RegisteredUser>
	{
		const response = await fetch(`https://localhost:8443/users/auth/login`,
			{
				method: 'POST',
				headers:
				{
					"Content-Type": 'application/json',
				},
				body: JSON.stringify({ username, password }),
			}
		);

		if (!response.ok)
			throw new Error(`Failed to login: ${response.status}`);

		const data = await response.json();
		console.log(data);
		return new RegisteredUser(username, data.id, data.accessToken);
	}

	async deleteUser(): Promise<void>
	{
		try
		{
			const response = await fetch('https://localhost:8443/users/me',
				{
					method: 'DELETE',
					headers:
					{
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.token}`,
					},
				});

			if (!response.ok)
				throw new Error(`User removal failed: ${response.status}`);

			localStorage.removeItem(localStorageKeyForRegisteredUser);
		}

		catch (error)
		{
			console.error('Error during user removal:', error);
			throw error;
		}
	}

	async logoutUser(): Promise<void>
	{
		try
		{
			const response = await fetch('https://localhost:8443/users/auth/logout',
				{
					method: 'POST',
					headers:
					{
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.token}`,
					},
				});

			if (!response.ok)
				throw new Error(`Logout failed: ${response.status}`);

			localStorage.removeItem(localStorageKeyForRegisteredUser);
		}

		catch (error)
		{
			console.error('Error during logout:', error);
			throw error;
		}
	}

}

class GuestUser extends User
{
	constructor(username: string)
	{
		super(username);
		localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify({ name: username }));
	}

	logoutUser(): void
	{
		localStorage.removeItem(localStorageKeyForGuestUser);
	}
}

async function getCurrentUser(): Promise<User | null>
{
	let user : User | null = null;
	const registeredUserJSON = localStorage.getItem(localStorageKeyForRegisteredUser);
	const guestUserJSON = localStorage.getItem(localStorageKeyForGuestUser);

	if (registeredUserJSON) {
		const userData = JSON.parse(registeredUserJSON);
		user = new RegisteredUser(userData.name, userData.id, userData.token);
	}

	else if (guestUserJSON) {
		const userData = JSON.parse(guestUserJSON);
		user = new GuestUser(userData.name);
	}

	return user;
}
