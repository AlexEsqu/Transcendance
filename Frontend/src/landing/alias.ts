
import { createAttachElement, injectHTMLPage } from "./utils";
import { displayGamePage } from "../app";

import welcomeHtml from "../pages/welcome.html";
import guestinHtml from "../pages/guestin.html";
import footerHTML from "../pages/footer.html"


export { displayGreetingHeader, displayAliasQueryPage, displayFooter }


const greetingTitleText = (alias: string) : string => `Welcome, ${alias}!`;

const deleteAliasLabelText : string = "If you want to delete your alias, click here:";
const deleteAliasButtonText : string = "Delete Alias";

const localStorageKeyForAlias : string = "PongAlias"


// function displaying the pages

function displayGreetingHeader(name : string) : void
{
	const grouping : string  = "greeting";

	// creating a semantic container for our page
	let headerContainer : HTMLElement = createAttachElement("header", document.body, grouping, grouping);

	// creating a title
	let greetingTitle : HTMLElement = createAttachElement("h1", headerContainer, grouping, grouping);
	greetingTitle.appendChild(document.createTextNode(greetingTitleText(name)));
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

function displayFooter() : void
{
	document.body.innerHTML += footerHTML

	const deleteAliasButton = document.getElementById('delete-name-btn')

	// adding a callback function to the delete data function
	deleteAliasButton.addEventListener("click", function ()
	{
		console.log("clicking delete button");
		localStorage.removeItem(localStorageKeyForAlias);
		displayAliasQueryPage();
	})
}
