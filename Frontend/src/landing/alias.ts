
import { createAttachElement, injectHTMLPage } from "./utils";
import { displayGamePage } from "../app";

import welcomeHtml from "../pages/welcome.html";
import guestinHtml from "../pages/guestin.html"


export { displayGreetingHeader, displayAliasQueryPage, displayAliasDeleteFooter }


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
		GuestInInput.value = "";
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

function displayAliasDeleteFooter() : void
{
	const grouping : string = "delete-alias";

	// creating a semantic container for our page
	const footerContainer : HTMLElement = createAttachElement("footer", document.body, grouping, grouping);

	// creating a label for the delete data button
	const deleteAliasLabel : HTMLElement = createAttachElement("label", footerContainer, grouping, grouping);
	deleteAliasLabel.appendChild(document.createTextNode(deleteAliasLabelText));

	// creating a button
	let deleteAliasButton : HTMLButtonElement = createAttachElement("button", footerContainer, grouping, grouping) as HTMLButtonElement;
	deleteAliasButton.appendChild(document.createTextNode(deleteAliasButtonText));

	// adding a callback function to the delete data function
	deleteAliasButton.addEventListener("click", function ()
	{
		console.log("clicking delete button");
		localStorage.removeItem(localStorageKeyForAlias);
		displayAliasQueryPage();
	})
}
