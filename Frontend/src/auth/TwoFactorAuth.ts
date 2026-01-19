import { UserState } from '../user/UserState';
import { RegisteredUser } from '../user/User';
import { apiDomainName, apiKey } from '../user/UserState';
import { FormModal, ErrorModal } from '../utils/Modal';
import { openErrorModal } from '../error/error';

import tfaModalHtml from '../html/info/twoFactorModal.html?raw';

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

		return data;
	}

	async login()
	{
		try
		{
			let verifiedData: TwoFactorResult | null = null;

			const modal = new FormModal(
				tfaModalHtml,
				// if user clicks confirm, reextract the code and try it
				async (formData) => {
					const code = formData.get('input-2fa') as string;
					try
					{
						verifiedData = await this.userState.twoFactor.check2faCode(code);
						// if data checked without exception being thrown, can close modal
						modal.close();
						const user = new RegisteredUser(verifiedData.id, verifiedData.accessToken);
						await this.userState.setUser(user);
					}
					catch (codeErr) {
						console.log('Error while using 2 Factor Authentication');
						if (codeErr instanceof Error)
							openErrorModal(codeErr);
					}
				},
				// If user cancels, close the modal
				() => {
					modal.close();
				}
			);

			modal.show();
		}
		catch (err)
		{
			console.log('2FA failed:', err);
			if (err instanceof Error)
				openErrorModal(err);
		}
	}
}
