import type { UserState } from "../user/UserState";
import { RegisteredUser } from "../user/User";
import { router } from "../app";

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

		window.addEventListener("message", this.handleOAuthMessage.bind(this));
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

		this.oauthWindow = window.open(`${this.apiDomainName}/users/auth/oauth/42`, "OAuth Login", features);

		const checkClosed = setInterval(() => {
			if (this.oauthWindow?.closed) {
				clearInterval(checkClosed);
				this.oauthWindow = null;
			}
		}, 500);
	}

	async handleOAuthMessage(event: MessageEvent): Promise<void>
	{
		if (event.source !== this.oauthWindow)
			return;

		const locationHref = event.source?.window?.location?.href;
		const url = new URL(locationHref ?? "");
		const twoFactorRequired = url.searchParams.get("twoFactorRequired") === "true";
		console.log("twoFactorRequired", twoFactorRequired);
		const { type, userId, error } = event.data;
		console.log("received data", event.data);
		if (type !== "oauth-callback") return;

		if (this.oauthWindow) {
			this.oauthWindow.close();
			this.oauthWindow = null;
		}

		if (error)
		{
			console.error("OAuth error:", error);
			throw new Error(error);
		}

		try
		{
			if (twoFactorRequired)
			{
				console.log('2FA required, prompting for code...');
				await this.userState.twoFactor.login();
			}

			if (userId)
				this.login(userId);
			else
				throw new Error("Unrecognized api response");

			await router.render();
		}
		catch (error)
		{
			console.error("OAuth login error:", error);
			throw error;
		}
	}

	async login(userId: number): Promise<void>
	{
		try {
			console.log("Fetching refresh token...");
			const response = await fetch(`${this.apiDomainName}/users/auth/refresh`, {
				method: "POST",
				credentials: "include",
				headers: {
					accept: "application/json",
					"X-App-Secret": `${this.apiKey}`,
				},
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error ?? "Failed to authenticate with OAuth");

			console.log("User id:", userId);
			console.log("User authenticated:", data);

			if (data.twoFactorRequired) {
				await this.userState.twoFactor.login();
			} else {
				const user = new RegisteredUser(userId, data.accessToken, data.username);
				await this.userState.setUser(user);
			}
			await router.render();
		} catch (error) {
			console.error("OAuth login error:", error);
			throw error;
		}
	}

	// technically not a method but an arrow function for use in router
	handleRedirectCallback = async (): Promise<void> =>
	{
		const urlParams = new URLSearchParams(window.location.search);
		const userId: string | null = urlParams.get("id");
		const error: string | null = urlParams.get("error");
		const twoFactorRequired: boolean = urlParams.get("twoFactorRequired") === "true";

		// if in popup
		if (window.opener)
		{
			console.log("Popup detected, sending message to parent...");
			OAuthService.sendCallbackToParent();
			setTimeout(() => window.close(), 500);
			return;
		}
		if (error)
			throw new Error(error);

		// if in main window
		if (twoFactorRequired)
			await this.userState.twoFactor.login();

		if (userId)
			await this.login(Number(userId));
	}

	static sendCallbackToParent(): void
	{
		console.log("sendCallbackToParent called");
		console.log("Current URL:", window.location.href);

		const targetOrigin = window.opener ? window.opener.location.origin : "*";

		const urlParams = new URLSearchParams(window.location.search);
		const userId = urlParams.get("id");
		const error = urlParams.get("error");

		console.log("URL params - userId:", userId, "error:", error);

		if (window.opener)
		{
			window.opener.postMessage({ type: "oauth-callback", userId: userId ? Number(userId) : null, error }, targetOrigin);
		}
	}
}
