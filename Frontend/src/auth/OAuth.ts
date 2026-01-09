import type { UserState } from "../user/UserState";
import { RegisteredUser } from "../user/User";
import { router } from "../app";

export class OAuthService
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

	async register(): Promise<void>
	{
		window.location.replace(`${this.apiDomainName}/users/auth/oauth/42`);
	}

	async login()
	{
		const urlParams = new URLSearchParams(window.location.search);
		const error = urlParams.get('error');

		if (error)
			throw new Error("error in the oauth callback");

		console.log(urlParams);

		try {
			const response = await fetch(
				`${this.apiDomainName}/users/auth/refresh`,
				{
					method: 'GET',
					credentials: 'include',
					headers:
					{
						'accept': 'application/json',
						'X-App-Secret': `${this.apiKey}`
					}
				}
			);

			const data = await response.json();

			if (!response.ok)
				throw new Error(data.error ?? 'Failed to authenticate with OAuth');

			// two fa verif if needed

			// refreshing user

		}
		catch (error) {
			console.error('OAuth callback error:', error);
			throw error;
		}
	}
}

