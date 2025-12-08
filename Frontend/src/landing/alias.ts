import { displayGamePage } from "../app";
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage } from "./user"
import { renderPageState } from "./history";

import welcomeHtml from "../pages/welcome.html";
import guestinHtml from "../pages/guestin.html";
import registerHtml from "../pages/register.html";
import loginHtml from "../pages/login.html";
import settingHtml from "../pages/setting.html"

export { displayAliasQueryPage, displayGamePage, displayLoginPage, displayRegisterPage, displayGuestInPage, displayUserSettingPage}

// replaces the document body with a menu page to choose to login, register or play as guest
function displayAliasQueryPage() : void
{
	document.body.innerHTML = welcomeHtml;

	const GuestInButton = document.getElementById('btn-guestin')
	GuestInButton.addEventListener("click", function ()
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

function displayGuestInPage() : void
{
	document.body.innerHTML = guestinHtml

	const GuestInInput : HTMLInputElement = document.getElementById('input-alias') as HTMLInputElement;
	const GuestInButton : HTMLElement = document.getElementById('btn-submit-alias')

	GuestInButton.addEventListener('click', function ()
	{
		const alias = GuestInInput.value;
		GuestInInput.value = ""; // reset input field
		console.log(alias);

		// checking the alias is not an empty string (a profanity checker would be funny...)
		if (alias)
		{
			new GuestUser(alias);
			let pageState = { page: 'game'};
			window.history.pushState(pageState, '', '#' + pageState.page);
			// displayGamePage();
			renderPageState(pageState);
		}
	})
}

function displayRegisterPage() : void
{
	document.body.innerHTML = registerHtml

	const loginInput : HTMLInputElement = document.getElementById('input-login') as HTMLInputElement;
	const passwordInput : HTMLInputElement = document.getElementById('input-password') as HTMLInputElement;
	const passwordCheckInput : HTMLInputElement = document.getElementById('input-password-check') as HTMLInputElement;
	const registerButton : HTMLElement = document.getElementById('btn-submit-register')

	registerButton.addEventListener('click', function ()
	{
		// store contents of the inputs
		const login = loginInput.value;
		const password = passwordInput.value;
		const passwordCheck = passwordCheckInput.value;

		// reset input fields
		loginInput.value = "";
		passwordInput.value = "";
		passwordCheckInput.value = "";

		// log for debug (TO DO: remove)
		console.log(`User tried to login with ${login} and ${password}`);

		if (password !== passwordCheck)
		{
			alert("The passwords and password check don't match...");
		}

		// checking the login and passwords are not an empty string (a profanity checker would be funny...)
		else if (login && password)
		{
			registerUser(login, password);
		}
	})
}

function displayLoginPage() : void
{
	document.body.innerHTML = loginHtml

	const loginInput : HTMLInputElement = document.getElementById('input-login') as HTMLInputElement;
	const passwordInput : HTMLInputElement = document.getElementById('input-password') as HTMLInputElement;
	const registerButton : HTMLElement = document.getElementById('btn-submit-login')

	registerButton.addEventListener('click', function ()
	{
		// store contents of the inputs
		const login = loginInput.value;
		const password = passwordInput.value;

		// reset input fields
		loginInput.value = "";
		passwordInput.value = "";

		// log for debug (TO DO: remove)
		console.log(`User tried to register with ${login} and ${password}`);

		// checking the login is not an empty string (a profanity checker would be funny...)
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

async function displayUserSettingPage()
{
	const user : User = await getUserFromLocalStorage();
	document.body.innerHTML = settingHtml;

	const submitAvatar = document.getElementById('btn-submit-avatar');
	const inputAvatar = document.getElementById('input-avatar') as HTMLInputElement;
	submitAvatar.addEventListener('click', () => {
		user.addAvatar(inputAvatar.value);
		inputAvatar.value = '';
	})

	const submitNewName = document.getElementById('btn-submit-rename-user');
	const inputNewName = document.getElementById('input-rename-user') as HTMLInputElement;
	submitNewName.addEventListener('click', () => {
		user.rename(inputNewName.value);
		inputNewName.value = '';
	})

	const submitNewPassword = document.getElementById('btn-submit-password');
	const inputOldPassword = document.getElementById('input-old-password') as HTMLInputElement;
	const inputNewPassword = document.getElementById('input-password') as HTMLInputElement;
	const inputNewPasswordCheck = document.getElementById('input-password-check') as HTMLInputElement;
	submitNewPassword.addEventListener('click', () => {
		if (inputNewPassword.value === inputNewPasswordCheck.value)
		{
			user.changePassword(inputOldPassword.value, inputNewPassword.value);
		}
		else
		{
			alert('The new password does not match');
		}
		inputNewPassword.value = '';
		inputNewPasswordCheck.value = '';
		inputOldPassword.value = '';
	})
}
