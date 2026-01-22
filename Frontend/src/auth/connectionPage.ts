import { userState, router } from "../app";
import { isValidInputs, checkInputValidityOnUnfocus } from "../utils/inputValidation";
import { EmailCheckModal } from "../utils/Modal";
import { openErrorModal } from "../error/error";

import connectionHtml from "../html/connection.html?raw";
import guestFormHtml from "../html/forms/guestForm.html?raw"
import loginFormHtml from "../html/forms/loginForm.html?raw"
import registerFormHtml from "../html/forms/registerForm.html?raw"


export {
	getConnectionPage,
	getRegisterForm, getGuestForm, getLoginForm,
	onAliasLoaded, onLoginLoaded, onRegisterLoaded }


// FUNCTION TO GET THE RELEVANT HTML BITS

function getConnectionPage(): string
{
	return connectionHtml;
}

function getLoginForm(): string
{
	return loginFormHtml;
}

function getGuestForm(): string
{
	return guestFormHtml;
}

function getRegisterForm(): string
{
	return registerFormHtml;
}

// FUNCTION TO PLUG JS ONTO THE HTML BIT

function onAliasLoaded(): void
{
	const guestForm = document.getElementById('guest-form') as HTMLFormElement | null;
	if (!guestForm)
		return

	checkInputValidityOnUnfocus(guestForm);
	guestForm?.addEventListener('submit', (e) =>
		{
			e.preventDefault();
			const formData = new FormData(guestForm);
			if (isValidInputs(guestForm.querySelectorAll('input')))
			{
				const alias = formData.get('input-alias') as string | null;
				if (alias)
					userState.guest.guestin(alias);
			}
		}
	);
}

function onRegisterLoaded(): void
{
	const registerForm = document.getElementById('register-form') as HTMLFormElement | null;
	if (!registerForm)
		return;

	checkInputValidityOnUnfocus(registerForm);
	registerForm.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(registerForm);

			if (isValidInputs(registerForm.querySelectorAll('input')))
			{
				const login = formData.get('input-login') as string | null;
				const email = formData.get('input-email') as string | null;
				const password = formData.get('input-password') as string | null;

				if (!login || !password || !email)
					return;

				try
				{
					await userState.emailAuth.register(login, password, email);
					const checkEmailModal = new EmailCheckModal(email);
					checkEmailModal.show();
				}
				catch (error)
				{
					if (error instanceof Error)
						openErrorModal(error);
				}
			}
		}
	);

	const oauthRegisterBtn = document.getElementById('oauth-btn') as HTMLButtonElement;
	oauthRegisterBtn.addEventListener('click', async (e) =>
		{
			e.preventDefault();
			try
			{
				await userState.oAuth.register();
			}
			catch (error)
			{
				if (error instanceof Error)
					openErrorModal(error);
			}
		}
	);
}

function onLoginLoaded(): void
{
	const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
	if (!loginForm)
		return;

	checkInputValidityOnUnfocus(loginForm);
	loginForm.addEventListener('submit', async (e) =>
		{
			e.preventDefault();

			if (isValidInputs(loginForm.querySelectorAll('input')))
			{
				const formData = new FormData(loginForm);
				const login = formData.get('input-login') as string | null;
				const password = formData.get('input-password') as string | null;

				if (login && password)
				{
					try
					{
						await userState.emailAuth.login(login, password);
					}
					catch (error)
					{
						if (error instanceof Error)
							openErrorModal(error);
					}
				}
			}
		}
	);

	const oauthLogInBtn = document.getElementById('oauth-login-btn') as HTMLButtonElement;
	oauthLogInBtn.addEventListener('click', async (e) =>
		{
			e.preventDefault();
			try
			{
				await userState.oAuth.register();
			}
			catch (error)
			{
				if (error instanceof Error)
					openErrorModal(error);
			}
		}
	);

	const resetPassBtn = document.getElementById('reset-pass-form') as HTMLButtonElement;
	resetPassBtn.addEventListener('click', async (e) =>
		{
			e.preventDefault();
			try
			{
				await userState.emailAuth.resetPass();
			}
			catch (error)
			{
				if (error instanceof Error)
					openErrorModal(error);
			}
		}
	);
}
