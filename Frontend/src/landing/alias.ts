import { userState } from "../app";
import { User, GuestUser, RegisteredUser } from "./User"
import { renderPageState } from "./history";

import welcomeHtml from "../pages/welcome.html";
import formHtml from "../pages/form.html";

import guestFormHtml from "../pages/forms/guestForm.html"
import loginFormHtml from "../pages/forms/loginForm.html"
import passwordFormHtml from "../pages/forms/passwordForm.html"
import registerFormHtml from "../pages/forms/registerForm.html"
import renameFormHtml from "../pages/forms/renameForm.html"
import avatarFormHtml from "../pages/forms/avatarForm.html"

export { displayAliasQueryPage, displayLoginPage, displayRegisterPage, displayGuestPage}

// replaces the document body with a menu page to choose to login, register or play as guest
function displayAliasQueryPage() : void
{
	document.body.innerHTML = welcomeHtml;

	const GuestButton = document.getElementById('btn-guestin')
	GuestButton.addEventListener("click", function ()
	{
		console.log("clicking alias button");
		let pageState = { page: 'loginAsGuest'};
		window.history.pushState(pageState, '', '#' + pageState.page)
		renderPageState(pageState);
	})

	const loginButton = document.getElementById('btn-login')
	loginButton.addEventListener("click", function ()
	{
		console.log("clicking login button");
		let pageState = { page: 'login'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	})

	const registerButton = document.getElementById('btn-register')
	registerButton.addEventListener("click", function ()
	{
		console.log("clicking register button");
		let pageState = { page: 'register'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	})
}

function displayGuestPage() : void
{
	document.body.innerHTML = '';
	document.body.insertAdjacentHTML('afterbegin', formHtml);
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
	document.body.innerHTML = '';
	document.body.insertAdjacentHTML('afterbegin', formHtml);
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
	document.body.innerHTML = '';
	document.body.insertAdjacentHTML('afterbegin', formHtml);
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



