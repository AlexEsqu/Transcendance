export {User, RegisteredUser, GuestUser}

const localStorageKeyForAlias : string = "PongAlias"

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
	constructor(name: string)
	{
		super(name);
		localStorage.setItem(localStorageKeyForAlias, name);
	}

	logoutUser(): void
	{
		localStorage.removeItem(localStorageKeyForAlias);
	}
}
