import { displayGamePage } from "../app";

import welcomeHtml from "../pages/welcome.html";
import guestinHtml from "../pages/guestin.html";


export { displayAliasQueryPage, localStorageKeyForAlias }

const localStorageKeyForAlias : string = "PongAlias"


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

function displayAliasQueryPage() : void
{
	document.body.innerHTML = welcomeHtml;

	const GuestInButton = document.getElementById('btn-guestin')
	GuestInButton.addEventListener("click", function ()
	{
		console.log("clicking submit alias button");
		displayGuestInPage();
	})
}

