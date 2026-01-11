import type { UserState } from "../user/UserState";
import { RegisteredUser, User } from "../user/User";

export class EmailAuthService
{
	apiDomainName: string;
	apiKey: string;
	userState: UserState;

	constructor(apiDomainName: string, apiKey: string, userState: UserState)
	{
		this.apiDomainName = apiDomainName;
		this.apiKey = apiKey;
		this.userState = userState;
	}

	async register(username: string, password: string, email: string): Promise<void>
	{
		const response = await fetch(
			`${this.apiDomainName}/users/signup`,
			{
				method: 'POST',
				headers:
				{
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

	async login(login: string, password: string): Promise<any> {
		const response = await fetch(
			`${this.apiDomainName}/users/auth/login`,
			{
				method: 'POST',
				headers:
				{
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

		if (data.twoFactorRequired && data.twoFactorToken)
		{
			try
			{
				const code = await this.userState.twoFactor.prompt2faCode();
				const verifiedData = await this.userState.twoFactor.check2faCode(code, data.twoFactorToken);
				const user = new RegisteredUser(login, verifiedData.id, verifiedData.accessToken);
				this.userState.setUser(user);
			}
			catch (err)
			{
				console.error('2FA failed:', err);
			}
		}
		else
		{
			const user = new RegisteredUser(login, data.id, data.accessToken);
			this.userState.setUser(user);
		}
	}

	async logout(): Promise<void>
	{
		const user = this.userState.getUser();

		if (user instanceof RegisteredUser)
		{
			const response = await this.userState.fetchWithTokenRefresh(
				`${this.apiDomainName}/users/auth/logout`,
				{
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${user.accessToken}`,
						'X-App-Secret': `${this.apiKey}`
					},
				}
			);

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || data.error || 'Logout Failed');
		}

		this.userState.resetUser();
	}

	async deleteAccount(): Promise<void>
	{
		const user = this.userState.getUser();

		if (user instanceof RegisteredUser)
		{
			const response = await this.userState.fetchWithTokenRefresh(
				`${this.apiDomainName}/users/me`,
				{
					method: 'DELETE',
					headers: {
						'accept': 'application/json',
						'Authorization': `Bearer ${user.accessToken}`,
						'X-App-Secret': `${this.apiKey}`
					},
				}
			);

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || data.error || 'Delete account Failed');
		}

		this.userState.resetUser();
	}
}
