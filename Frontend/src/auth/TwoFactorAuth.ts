import { UserState } from '../user/UserState';
import { RegisteredUser } from '../user/User';
import { apiDomainName, apiKey } from '../user/UserState';
import { FormModal, ErrorModal } from '../utils/Modal';
import { openErrorModal } from '../error/error';

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

		user.hasTwoFactorAuth = val;
		this.userState.notifySubscribers();
	}

	async prompt2faCode(): Promise<string>
	{
		console.log('Creating 2FA modal...');
		return new Promise((resolve, reject) => {
			const modal = new FormModal(
				modalHtml,
				async (formData) =>
					{
						const code = formData.get('input-2fa') as string;
						console.log(code);
						resolve(code)
					}, // if user click submit 2fa
				() => reject(new Error('2FA cancelled')) // if user click cancel
			);
			modal.show();
		});
	}

	async check2faCode(code: string): Promise<TwoFactorResult>
	{
		console.log(`sending code : ${code}`);

		const response = await fetch(
			`${apiDomainName}/users/auth/login/2fa`,
			{
				method: 'POST',
				headers: {
					'accept': 'application/json',
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

	async login()
	{
		try
		{
			console.log('Enter 2FA login');
			const code = await this.userState.twoFactor.prompt2faCode();
			const verifiedData = await this.userState.twoFactor.check2faCode(code);
			const user = new RegisteredUser(verifiedData.id, verifiedData.accessToken);
			await this.userState.setUser(user);
		}
		catch (err )
		{
			console.log('2FA failed:', err);
			if (err instanceof Error)
				openErrorModal(err);
		}
	}
}
