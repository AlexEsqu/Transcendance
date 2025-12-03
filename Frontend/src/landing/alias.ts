import { displayGamePage, alias } from "../app";
import { User, GuestUser, RegisteredUser } from "./user"

import welcomeHtml from "../pages/welcome.html";
import guestinHtml from "../pages/guestin.html";
import registerHtml from "../pages/register.html";
import loginHtml from "../pages/login.html";


export { displayAliasQueryPage, removeGuestName }

const localStorageKeyForAlias : string = "PongAlias"

// replaces the document body with a menu page to choose to login, register or play as guest
function displayAliasQueryPage() : void
{
	document.body.innerHTML = welcomeHtml;

	const GuestInButton = document.getElementById('btn-guestin')
	GuestInButton.addEventListener("click", function ()
	{
		console.log("clicking alias button");
		displayGuestInPage();
	})

	const loginButton = document.getElementById('btn-login')
	loginButton.addEventListener("click", function ()
	{
		console.log("clicking login button");
		displayLoginPage();
	})

	const registerButton = document.getElementById('btn-register')
	registerButton.addEventListener("click", function ()
	{
		console.log("clicking register button");
		displayRegisterPage();
	})
}

// removes guest name from localstorage, displays a query page
function removeGuestName() : void
{
	localStorage.removeItem(localStorageKeyForAlias);
}

function displayGuestInPage() : void
{
	document.body.innerHTML = guestinHtml

	const GuestInInput : HTMLInputElement = document.getElementById('input-alias') as HTMLInputElement;
	const GuestInButton : HTMLElement = document.getElementById('btn-submitalias')

	GuestInButton.addEventListener('click', function ()
	{
		const alias = GuestInInput.value;
		GuestInInput.value = ""; // reset input field
		console.log(alias);

		// checking the alias is not an empty string (a profanity checker would be funny...)
		if (alias)
		{
			localStorage.setItem(localStorageKeyForAlias, alias);
			displayGamePage();
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
			displayGamePage();
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
		localStorage.setItem('RegisteredUser', JSON.stringify(user));
		displayGamePage();
	}
	catch (error)
	{
		console.error('Failed to fetch users:', error);
		alert('Failed to login user')
		displayAliasQueryPage();
	}
}
