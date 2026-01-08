import type { UserState } from "../user/UserState";

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
		// TO DO
	}

}
