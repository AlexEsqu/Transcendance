import { userState, router } from "../app";

import connectionHtml from "../pages/connection.html?raw";

import formHtml from "../pages/form.html?raw";
import guestFormHtml from "../pages/forms/guestForm.html?raw"
import loginFormHtml from "../pages/forms/loginForm.html?raw"
import registerFormHtml from "../pages/forms/registerForm.html?raw"

export {
	getConnectionLandingHtml,
	getConnectionForm,
	initConnectionPageListeners }


// FUNCTION TO GET THE RELEVANT HTML BITS

function getConnectionLandingHtml(): string
{
	return connectionHtml;
}

function getConnectionForm(): string {

	return formHtml;
}

// FUNCTION TO ACTIVATE THE EVENT LISTENERS AND POSSIBLE BUTTON INTERACTIONS
// ONCE THE PAGE IS LOADED

function initConnectionPageListeners(): void
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

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
	injectForm(guestFormHtml);

	const guestForm = document.getElementById('guest-form') as HTMLFormElement | null;
	guestForm?.addEventListener('submit', (e) =>
		{
			e.preventDefault();
			const formData = new FormData(guestForm);
			const alias = formData.get('input-alias') as string | null;
			if (alias)
				userState.loginAsGuest(alias);
		}
	);
}

function onRegisterLoaded(): void
{
	injectForm(registerFormHtml);

	const registerForm = document.getElementById('register-form') as HTMLFormElement | null;
	registerForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(registerForm);
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

			await userState.register(login, password, email);
		}
	);
}

function onLoginLoaded(): void
{
	injectForm(loginFormHtml);

	const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
	loginForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();

			const formData = new FormData(loginForm);
			const login = formData.get('input-login') as string | null;
			const password = formData.get('input-password') as string | null;

			if (login && password)
				await userState.loginAsRegistered(login, password);
		}
	);
}


// UTILITIES

function injectForm(html: string): void
{
	const container = document.getElementById('form-container');
	if (container) container.insertAdjacentHTML('beforeend', html);
}
