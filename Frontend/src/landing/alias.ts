import { displayGamePage } from "../app";
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage } from "./user"
import { renderPageState } from "./history";

import welcomeHtml from "../pages/welcome.html";
import formHtml from "../pages/form.html";
import userHtml from "../pages/user.html";

import avatarFormHtml from "../pages/forms/avatarForm.html"
import guestFormHtml from "../pages/forms/guestForm.html"
import loginFormHtml from "../pages/forms/loginForm.html"
import passwordFormHtml from "../pages/forms/passwordForm.html"
import registerFormHtml from "../pages/forms/registerForm.html"
import renameFormHtml from "../pages/forms/renameForm.html"

export { displayAliasQueryPage, displayGamePage, displayLoginPage, displayRegisterPage, displayGuestPage, displayUserPage}

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
			new GuestUser(alias);
			let pageState = { page: 'game'};
			window.history.pushState(pageState, '', `#${pageState.page}`);
			renderPageState(pageState);
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
			registerUser(login, password);
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
			loginUser(login, password);
		}
	})
}

async function registerUser(log: string, pass: string) : Promise<void>
{
	try
	{
		const response = await fetch('https://localhost:8443/users/signup',
			{
				method: 'POST',
				headers: {
					"Content-Type": 'application/json',
				},
				body: JSON.stringify({ username: log, password: pass }),
			});

		if (!response.ok)
			throw new Error(`HTTP error! status: ${response.status}`);
		const data = await response.json();

		console.log(data);
	}
	catch (error)
	{
		console.error('Failed to fetch users:', error);
		if (error.status == 409)
			alert('Username is already used')
		else
			alert('Failed to create user')
	}
	finally
	{
		displayAliasQueryPage();
	}
}

async function loginUser(login: string, password: string) : Promise<void>
{
	try
	{
		const user = await RegisteredUser.createUserFromLogin(login, password);
		let pageState = { page: 'game'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	}
	catch (error)
	{
		console.error('Failed to fetch users:', error);
		alert('Failed to login user')
		displayAliasQueryPage();
	}
}

async function displayUserPage()
{
	const user : User = await getUserFromLocalStorage();
	document.body.innerHTML = userHtml;

	// const submitAvatar = document.getElementById('btn-submit-avatar');
	// const inputAvatar = document.getElementById('input-avatar') as HTMLInputElement;
	// submitAvatar.addEventListener('click', () => {
	// 	user.addAvatar(inputAvatar.value);
	// 	inputAvatar.value = '';
	// })

	// const submitNewName = document.getElementById('btn-submit-rename-user');
	// const inputNewName = document.getElementById('input-rename-user') as HTMLInputElement;
	// submitNewName.addEventListener('click', () => {
	// 	user.rename(inputNewName.value);
	// 	inputNewName.value = '';
	// })

	// const submitNewPassword = document.getElementById('btn-submit-password');
	// const inputOldPassword = document.getElementById('input-old-password') as HTMLInputElement;
	// const inputNewPassword = document.getElementById('input-password') as HTMLInputElement;
	// const inputNewPasswordCheck = document.getElementById('input-password-check') as HTMLInputElement;
	// submitNewPassword.addEventListener('click', () => {
	// 	if (inputNewPassword.value === inputNewPasswordCheck.value)
	// 	{
	// 		user.changePassword(inputOldPassword.value, inputNewPassword.value);
	// 	}
	// 	else
	// 	{
	// 		alert('The new password does not match');
	// 	}
	// 	inputNewPassword.value = '';
	// 	inputNewPasswordCheck.value = '';
	// 	inputOldPassword.value = '';
	// })
}
