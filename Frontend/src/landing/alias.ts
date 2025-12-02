import { displayGamePage } from "../app";

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
		console.log("clicking submit alias button");
		displayGuestInPage();
	})

	const registerButton = document.getElementById('btn-register')
	registerButton.addEventListener("click", function ()
	{
		console.log("clicking submit register button");
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
	const registerButton : HTMLElement = document.getElementById('btn-submit-register')

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
		if (login && false)
		{

			displayGamePage();
		}
	})
}
