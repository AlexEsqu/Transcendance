export {User, RegisteredUser, GuestUser }

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

	constructor(name: string, id: number, accessToken: string)
	{
		super(name);
		this.id = id;
		this.accessToken = accessToken;
	}

	async updateAvatar(imageUrl : string): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/me/avatar',
			{
				method: 'PUT',
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
	}

	async rename(newName : string): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/me/username',
			{
				method: 'PUT',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({
					username: newName
				})
			});

		if (!response.ok)
			throw new Error('Renaming failed');

		this.name = newName;
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void>
	{
		const response = await fetch('https://localhost:8443/users/me/password', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.accessToken}`,
			},
			body: JSON.stringify({
				oldPassword, newPassword
			})
		});

		if (!response.ok)
			throw new Error('Password change failed');
	}
}

class GuestUser extends User
{
	constructor(username: string)
	{
		super(username);
	}

	rename(newName : string): void
	{
		this.name = newName;
	}

}



