export {User, RegisteredUser, GuestUser, getUserFromLocalStorage,  }
import { userObject } from "../app"


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

	abstract logoutUser(): Promise<void>;
	abstract saveToStorage(): void;

	getName(): string
	{
		return this.name;
	}

	getAvatarPath(): string
	{
		return this.avatarPath;
	}
}

class RegisteredUser extends User
{
	id: number | null;
	accessToken: string | null;

	private constructor(name: string, id: number, accessToken: string)
	{
		super(name);
		this.id = id;
		this.accessToken = accessToken;
	}

	static async register(username: string, password: string): Promise<RegisteredUser>
	{
		const response = await fetch('https://localhost:8443/users/signup',
		{
			method: 'POST',
			headers: {
				"Content-Type": 'application/json',
			},
			body: JSON.stringify(
				{
					username: username,
					password: password
				}),
		});

		if (!response.ok) {
			if (response.status === 409)
				throw new Error('Username already exists');
			throw new Error('Registration failed');
		}

		const data = await response.json();

		console.log(data);

		// if registration is successful, goes on to login
		return this.login(username, password);
	}

	static async login(username: string, password: string): Promise<RegisteredUser>
	{
		const response = await fetch(`https://localhost:8443/users/auth/login`,
			{
				method: 'POST',
				headers:
				{
					"accept": "*/*",
					"Content-Type": 'application/json',
				},
				body: JSON.stringify(
					{
						username: username,
						password: password
					}),
			}
		);

		if (!response.ok)
			throw new Error(`Failed to login: ${response.status}`);

		const data = await response.json();
		console.log(data);

		return new RegisteredUser(username, data.id, data.accessToken);
	}

	static loadFromStorage(): RegisteredUser | null
	{
		const registeredUserJSON = localStorage.getItem(localStorageKeyForRegisteredUser);
		if (registeredUserJSON)
		{
			const userData = JSON.parse(registeredUserJSON);
			return new RegisteredUser(userData.name, userData.id, userData.token);
		}

		// const guestUserJSON = localStorage.getItem(localStorageKeyForGuestUser);
		// if (guestUserJSON)
		// {
		// 	const userData = JSON.parse(guestUserJSON);
		// 	return new GuestUser(userData.name);
		// }

		return null;
	}

	saveToStorage(): void
	{
		localStorage.setItem(localStorageKeyForRegisteredUser, JSON.stringify(
			{
				name: this.name,
				id: this.id,
				accessToken: this.accessToken,
				avatarPath: this.avatarPath
			})
		)
	}

	// async deleteAccount(): Promise<void>
	// {
	// 	try
	// 	{
	// 		const response = await fetch('https://localhost:8443/users/me',
	// 			{
	// 				method: 'DELETE',
	// 				headers:
	// 				{
	// 					'accept': '*/*',
	// 					'Authorization': `Bearer ${this.accessToken}`
	// 				},
	// 			});

	// 		if (!response.ok)
	// 			throw new Error(`User removal failed: ${response.status}`);

	// 		localStorage.removeItem(localStorageKeyForRegisteredUser);
	// 	}

	// 	catch (error)
	// 	{
	// 		console.error('Error during user removal:', error);
	// 		throw error;
	// 	}
	// }

	async logoutUser(): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/auth/logout',
			{
				method: 'POST',
				headers:
				{
					'accept': '*/*',
					'Authorization': `Bearer ${this.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
			}
		);

		if (!response.ok)
			throw new Error(`Logout failed: ${response.status}`);

		localStorage.removeItem(localStorageKeyForRegisteredUser);
	}

	async updateAvatar(imageUrl : string): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/me',
			{
				method: 'PATCH',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({
					'profilePictureUrl': `${imageUrl}`
				})
			});

		if (!response.ok)
			throw new Error(`Avatar update failed: ${response.status}`);

		this.avatarPath = imageUrl;
		this.saveToStorage();
	}

	async rename(newName : string): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/me',
			{
				method: 'PATCH',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({ username: newName })
			});

		if (!response.ok)
			throw new Error('Renaming failed');

		this.name = newName;
		this.saveToStorage();
	}

	// async changePassword(oldPass : string, newPass : string): Promise<void>
	// {
	// 	try
	// 	{
	// 		const response = await fetch('https://localhost:8443/users/me/password',
	// 			{
	// 				method: 'PATCH',
	// 				headers:
	// 				{
	// 					'accept': 'application/json',
	// 					'Content-Type': 'application/json',
	// 					'Authorization': `Bearer ${this.accessToken}`,
	// 					'X-App-Secret': `${apiKey}`
	// 				},
	// 				body: JSON.stringify({
	// 					oldPassword: oldPass,
	// 					newPassword: newPass
	// 				})
	// 			});

	// 		if (!response.ok)
	// 			throw new Error(`Password change failed: ${response.status}`);

	// 	}

	// 	catch (error)
	// 	{
	// 		console.error('Error during logout:', error);
	// 		throw error;
	// 	}
	// }

}

class GuestUser extends User
{
	constructor(username: string)
	{
		super(username);
	}

	saveToStorage(): void
	{
		localStorage.setItem(localStorageKeyForGuestUser, JSON.stringify(
			{
				name: this.name,
				avatarPath: this.avatarPath
			}
		));
	}

	async logoutUser(): Promise<void>
	{
		localStorage.removeItem(localStorageKeyForGuestUser);
	}

	// deleteAccount(): void
	// {
	// 	this.logoutUser();
	// }

	// addAvatar(imageUrl : string): void
	// {
	// 	alert("You need to be a registered user to change your avatar")
	// }

	// rename(newName : string): void
	// {
	// 	this.name = newName;
	// }

	// changePassword(oldPassword : string, newPassword : string): void
	// {
	// 	alert("You need to be a registered user to change your password")
	// }

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



