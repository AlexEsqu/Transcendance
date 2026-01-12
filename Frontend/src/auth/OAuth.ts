import type { UserState } from "../user/UserState";
import { RegisteredUser } from "../user/User";
import { router } from "../app";

export { initOAuthCallback }
export class OAuthService
{
	apiDomainName: string;
	apiKey: string;
	userState: UserState;
	oauthWindow: Window | null = null;

	constructor(apiDomainName: string, apiKey: string, userState: UserState)
	{
		this.apiDomainName = apiDomainName;
		this.apiKey = apiKey;
		this.userState = userState;

		window.addEventListener('message', this.handleOAuthMessage.bind(this));
	}

	async register(): Promise<void>
	{
		this.openOAuthPopup();
	}

	openOAuthPopup(): void
	{
		const width = 600;
		const height = 700;
		const left = (window.screen.width - width) / 2;
		const top = (window.screen.height - height) / 2;

		const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

		this.oauthWindow = window.open(
			`${this.apiDomainName}/users/auth/oauth/42`,
			'OAuth Login',
			features
		);

		const checkClosed = setInterval(() =>
			{
				if (this.oauthWindow?.closed)
				{
					clearInterval(checkClosed);
					this.oauthWindow = null;
				}
			},
		500);
	}

	async handleOAuthMessage(event: MessageEvent): Promise<void>
	{
		if (event.source !== this.oauthWindow)
			return;

		const { type, userId, error } = event.data;

		if (type !== 'oauth-callback')
			return;

		if (this.oauthWindow)
		{
			this.oauthWindow.close();
			this.oauthWindow = null;
		}

		if (error)
		{
			console.error('OAuth error:', error);
			throw new Error(error);
		}

		if (!userId || Number.isNaN(userId))
		{
			throw new Error('No user ID received');
		}

		await this.login(Number(userId));
	}

	async login(userId: number): Promise<void>
	{
		try {
			const response = await fetch(
				`${this.apiDomainName}/users/auth/refresh`,
				{
					method: 'POST',
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

			console.log('User id:', userId);
			console.log('User authenticated:', data);

			if (data.twoFactorRequired && data.twoFactorToken)
			{
				try
				{
					const code = await this.userState.twoFactor.prompt2faCode();
					const verifiedData = await this.userState.twoFactor.check2faCode(code, data.twoFactorToken);
					const user = new RegisteredUser(data.username, userId, verifiedData.accessToken);
					await this.userState.setUser(user);
					router.render();
				}
				catch (err)
				{
					console.error('2FA failed:', err);
				}
			}
			else
			{
				const user = new RegisteredUser(data.username, userId, data.accessToken);
				await this.userState.setUser(user);
			}

		}
		catch (error) {
			console.error('OAuth callback error:', error);
			throw error;
		}
	}

	static sendCallbackToParent(): void
	{
		const targetOrigin = window.opener ? window.opener.location.origin : '*';

		const urlParams = new URLSearchParams(window.location.search);
		const userId = urlParams.get('id');
		const error = urlParams.get('error');

		if (window.opener) {
			window.opener.postMessage(
				{ type: 'oauth-callback', userId, error },
				targetOrigin
			);
		}
		setTimeout(() => window.close(), 300);
	}
}

function initOAuthCallback(): void
{
	if (window.location.search.includes('id=') || window.location.search.includes('error=')) {
		OAuthService.sendCallbackToParent();

		document.body.innerHTML = '<div style="text-align: center; padding: 2rem;">Authentication successful. This window will close automatically...</div>';

		setTimeout(() => {
			window.close();
		}, 1000);
	}
}
