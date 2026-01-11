import { userState, router } from "../app";
import { isValidInputs, checkInputValidityOnUnfocus } from "../utils/inputValidation";

import connectionHtml from "../html/connection.html?raw";
import guestFormHtml from "../html/forms/guestForm.html?raw"
import loginFormHtml from "../html/forms/loginForm.html?raw"
import registerFormHtml from "../html/forms/registerForm.html?raw"
import checkEmailHtml from "../html/info/checkEmail.html?raw"
import check2faHtml from "../html/info/twoFactorCheck.html"

export {
	getConnectionLandingHtml,
	getConnectionForm,
	getEmailCheck, get2FACheck,
	initConnectionPageListeners }


// FUNCTION TO GET THE RELEVANT HTML BITS

function getConnectionLandingHtml(): string
{
	return connectionHtml;
}

function getConnectionForm(): string {

	return "";
}

function getEmailCheck(): string
{
	return checkEmailHtml;
}

function get2FACheck(): string
{
	return check2faHtml;
}

// FUNCTION TO ACTIVATE THE EVENT LISTENERS AND POSSIBLE BUTTON INTERACTIONS
// ONCE THE PAGE IS LOADED

function initConnectionPageListeners(): void
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const customEvent = event as CustomEvent<{ path: string; search: string }>;
		const { path, search } = customEvent.detail;

		switch (path)
		{
			case '/connection/alias':
			{
				onAliasLoaded();
				return;
			}

			case '/connection/register':
			{
				onRegisterLoaded();
				return;
			}

			case '/connection/login':
			{
				onLoginLoaded();
				return;
			}

			default:
			{
				return;
			}

		}
	});
}

function onAliasLoaded(): void
{
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', guestFormHtml);

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
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', registerFormHtml);

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
				const check = formData.get('input-password-check') as string | null;

				if (!login || !password || !email)
					return;

				if (password !== check)
				{
					alert("The passwords don't match...");
					return;
				}

				try
				{
					await userState.emailAuth.register(login, password, email);
					router.navigateTo("/connection/emailcheck");
				}
				catch (error)
				{
					const msg = error instanceof Error ? error.message : "Unknown error";
					window.sessionStorage.setItem("errorMessage", msg);
					router.navigateTo("/error");
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
				const msg = error instanceof Error ? error.message : "OAuth failed";
				window.sessionStorage.setItem("errorMessage", msg);
				router.navigateTo("/error");
			}
		}
	);
}

function onLoginLoaded(): void
{
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', loginFormHtml);

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
						const msg = error instanceof Error ? error.message : "Unknown error";
						console.log(`error message is ${msg}`);
						window.sessionStorage.setItem("errorMessage", msg);
						router.navigateTo("/error");
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
				const msg = error instanceof Error ? error.message : "OAuth failed";
				window.sessionStorage.setItem("errorMessage", msg);
				router.navigateTo("/error");
			}
		}
	);
}
