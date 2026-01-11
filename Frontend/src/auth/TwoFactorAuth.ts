import { UserState } from '../user/UserState';
import { RegisteredUser } from '../user/User';
import { apiDomainName, apiKey } from '../user/UserState';
import { Modal } from '../utils/Modal';

import modalHtml from '../html/info/twoFactorModal.html?raw';

interface TwoFactorResult {
	id: number;
	accessToken: string;
}

export class TwoFactorAuthService
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

	async prompt2faCode(): Promise<string>
	{
		return new Promise((resolve, reject) => {
			const modal = new Modal(
				modalHtml,
				async (code) =>
					{
						console.log(code);
						resolve(code)
					}, // if user click submit 2fa
				() => reject(new Error('2FA cancelled')) // if user click cancel
			);
			modal.show();
		});
	}

	async check2faCode(code: string, twoFactorToken: string): Promise<TwoFactorResult>
	{
		console.log(`sending code : ${code}`);

		const response = await fetch(
			`${apiDomainName}/users/auth/login/2fa?twoFactorToken=${twoFactorToken}`,
			{
				method: 'POST',
				headers: {
					'accept': 'application/json',
					// 'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code: code })
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || data.error || '2FA verification failed');

		console.log(`data received is ${data}`);

		return data;
	}
}
