export {User, RegisteredUser, GuestUser, getUserFromLocalStorage, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser}

const localStorageKeyForGuestUser : string = "PongGuestUser"
const localStorageKeyForRegisteredUser : string = "PongRegisteredUser"
const placeholderAvatar : string = "./placeholder/avatarPlaceholder.png"

const apiKey : string = process.env.APP_SECRET_KEY ?? "oups";
console.log('API Key loaded:', apiKey ? 'yes' : 'no');

const ENV = {
  APP_SECRET_KEY: process.env.APP_SECRET_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

console.log('Environment:', ENV);

abstract class User {
	name: string;
	avatarPath: string;

	constructor(name: string)
	{
		this.name = name;
		this.avatarPath = placeholderAvatar;
	}

	abstract logoutUser(): void

	abstract deleteAccount(): void

	abstract addAvatar(imageUrl : string): void

	abstract rename(newName : string): void

	abstract changePassword(oldPassword : string, newPassword : string): void

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
					"accept": "*/*",
					"Content-Type": 'application/json',
				},
				body: JSON.stringify({ username: username, password: password }),
			}
		);

		if (!response.ok)
			throw new Error(`Failed to login: ${response.status}`);

		const data = await response.json();
		console.log(data);
		return new RegisteredUser(username, data.id, data.accessToken);
	}

	async deleteAccount(): Promise<void>
	{
		try
		{
			const response = await fetch('https://localhost:8443/users/me',
				{
					method: 'DELETE',
					headers:
					{
						'accept': '*/*',
						'Authorization': `Bearer ${this.token}`
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
						'accept': '*/*',
						'Authorization': `Bearer ${this.token}`,
						'X-App-Secret': `${apiKey}`
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

	async addAvatar(imageUrl : string): Promise<void>
	{
		try
		{
			const response = await fetch('https://localhost:8443/users/me',
				{
					method: 'PATCH',
					headers:
					{
						'accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.token}`,
						'X-App-Secret': `${apiKey}`
					},
					body: JSON.stringify({
						'profilePictureUrl': `${imageUrl}`
					})
				});

			if (!response.ok)
				throw new Error(`Logout failed: ${response.status}`);

			localStorage.removeItem(localStorageKeyForRegisteredUser);
			this.avatarPath = imageUrl;
		}

		catch (error)
		{
			console.error('Error during logout:', error);
			throw error;
		}
	}

	async rename(newName : string): Promise<void>
	{
		this.name = newName;
		// TO DO when db has a route

	}

	async changePassword(oldPass : string, newPass : string): Promise<void>
	{
		try
		{
			const response = await fetch('https://localhost:8443/users/me/password',
				{
					method: 'PATCH',
					headers:
					{
						'accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${this.token}`,
						'X-App-Secret': `${apiKey}`
					},
					body: JSON.stringify({
						oldPassword: oldPass,
						newPassword: newPass
					})
				});

			if (!response.ok)
				throw new Error(`Password change failed: ${response.status}`);

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
		localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify({ name: this.name }));
	}

	logoutUser(): void
	{
		localStorage.removeItem(localStorageKeyForGuestUser);
	}

	deleteAccount(): void
	{
		this.logoutUser();
	}

	addAvatar(imageUrl : string): void
	{
		alert("You need to be a registered user to change your avatar")
	}

	rename(newName : string): void
	{
		this.name = newName;
	}

	changePassword(oldPassword : string, newPassword : string): void
	{
		alert("You need to be a registered user to change your password")
	}
}

async function getUserFromLocalStorage(): Promise<User | null>
{
	let user : User | null = null;

	console.log('getting user');
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

	console.log('user obtained');
	return user;
}


