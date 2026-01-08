import { UserState } from '../user/UserState';
import { RegisteredUser } from '../user/User';
import { apiDomainName, apiKey } from '../user/UserState';

export class TwoFactorService
{
	userState: UserState;

	constructor(userState: UserState)
	{
		this.userState = userState;
	}

	async toggle2fa(val: boolean): Promise<void>
	{
		const user = this.userState.getUser();

		if (!(user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/2fa`,
			{
				method: 'PUT',
				headers: {
					'accept': 'application/json',
					'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					enabled: val
				})
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || '2FA enable failed');

		user.hasTwoFactorAuth = true;
		this.userState.setUser(user);
	}
}
