import { userState } from "../app";
import { User, GuestUser, RegisteredUser } from "../user/User"
import { renderPageState } from "../history/history";
import { goToPage } from "../history/nav";

import connectionHtml from "../pages/connection.html";
import formHtml from "../pages/form.html";

import guestFormHtml from "../pages/forms/guestForm.html"
import loginFormHtml from "../pages/forms/loginForm.html"
import passwordFormHtml from "../pages/forms/passwordForm.html"
import registerFormHtml from "../pages/forms/registerForm.html"
import renameFormHtml from "../pages/forms/renameForm.html"
import avatarFormHtml from "../pages/forms/avatarForm.html"

export { displayConnectionPage, displayLoginPage, displayRegisterPage, displayGuestPage}

function getMainElement(): HTMLElement {
	let main = document.querySelector('main');
	if (!main)
	{
		main = document.createElement('main');
		document.body.appendChild(main);
	}
	return main as HTMLElement;
}

// replaces the document body with a menu page to choose to login, register or play as guest
function displayConnectionPage() : void
{
	const main = getMainElement();
	main.innerHTML = connectionHtml;

	const GuestButton = document.getElementById('btn-guestin')
	GuestButton.addEventListener("click", function ()
	{
		console.log("clicking alias button");
		goToPage('/connection/alias');
	})

	const loginButton = document.getElementById('btn-login')
	loginButton.addEventListener("click", function ()
	{
		console.log("clicking login button");
		goToPage('/connection/login');
	})

	const registerButton = document.getElementById('btn-register')
	registerButton.addEventListener("click", function ()
	{
		console.log("clicking register button");
		goToPage('/connection/register');
	})
}

function displayGuestPage() : void
{
	const main = document.querySelector('main');
	main.insertAdjacentHTML('afterbegin', formHtml);

	const container = document.getElementById('form-container');
	container.insertAdjacentHTML('beforeend', guestFormHtml);

	const guestForm : HTMLFormElement = document.getElementById('guest-form') as HTMLFormElement;
	guestForm.addEventListener('submit', function (e)
	{
		e.preventDefault();
		const formData = new FormData(guestForm);
		const alias = formData.get('input-alias') as string;

		console.log(alias); // TODO : remove

		if (alias) {
			userState.loginAsGuest(alias);
		}
	})
}

function displayRegisterPage() : void
{
	const main = getMainElement();
	main.innerHTML = formHtml;

	const container = document.getElementById('form-container');
	container.insertAdjacentHTML('beforeend', registerFormHtml);

	const registerForm : HTMLFormElement = document.getElementById('register-form') as HTMLFormElement;

	registerForm.addEventListener('submit', function (e)
	{
		e.preventDefault();

		const formData = new FormData(registerForm);
		const login = formData.get('input-login') as string;
		const password = formData.get('input-password') as string;
		const passwordCheck = formData.get('input-password-check') as string;

		console.log(`User tried to register with ${login}`);

		if (password !== passwordCheck)
		{
			alert("The passwords don't match...");
		}

		else if (login && password)
		{
			userState.register(login, password);
		}
	})
}

function displayLoginPage() : void
{
	const main = getMainElement();
	main.innerHTML = formHtml;

	const container = document.getElementById('form-container');
	container.insertAdjacentHTML('beforeend', loginFormHtml);

	const loginForm : HTMLFormElement = document.getElementById('login-form') as HTMLFormElement;

	loginForm.addEventListener('submit', function (e)
	{
		e.preventDefault();

		const formData = new FormData(loginForm);
		const login = formData.get('input-login') as string;
		const password = formData.get('input-password') as string;

		console.log(`User tried to login with ${login}`);

		if (login && password)
		{
			userState.loginAsRegistered(login, password);
		}
	})
}



