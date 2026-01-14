import type { UserState } from "../user/UserState";
import { RegisteredUser } from "../user/User";

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
		// const response = await fetch(
		// 	`${this.apiDomainName}/users/auth/oauth/42/callback`,
		// 	{
		// 		method: 'GET',
		// 		headers: {
		// 			'accept': 'application/json',
		// 			// 'Content-Type': 'application/json',
		// 			'X-App-Secret': this.apiKey
		// 		},
		// 	}
		// );

		// const data = await response.json();
		// if (!response.ok) {
		// 	throw new Error(data.message || data.error || 'OAuth login failed');
		// }

		// const user = new RegisteredUser(data.username, data.id, data.accessToken);
		// this.userState.setUser(user);

		// window.location.replace('/');
		window.location.replace(`${this.apiDomainName}/users/auth/oauth/42`);
	}

}
