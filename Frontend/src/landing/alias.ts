
import { createAttachElement } from "./utils";
import { displayGamePage } from "../app";

export { displayGreetingHeader, displayAliasQueryPage, displayAliasDeleteFooter }


// Test content of sections to be edited here

const submitAliasButtonText : string = "Submit";
const submitAliasTitleText : string = "Who are you ?";
const submitAliasLabelText : string = "Submit a username to start playing.";

const greetingTitleText = (alias: string) : string => `Welcome, ${alias}!`;

const deleteAliasLabelText : string = "If you want to delete your alias, click here:";
const deleteAliasButtonText : string = "Delete Alias";

const localStorageKeyForAlias : string = "PongAlias"

const mainContainer : HTMLElement = document.getElementById("main");


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

function displayAliasQueryPage() : void
{
	document.body.innerHTML = "";

	const grouping : string = "alias-query";

	// creating a container for our page (preferring semantic "main" instead of div, might change my mind)
	const mainContainer : HTMLElement = createAttachElement("main", document.body, grouping, grouping);

	// creating a title
	let submitAliasTitle : HTMLElement = createAttachElement("h1", mainContainer, grouping, grouping);
	submitAliasTitle.appendChild(document.createTextNode(submitAliasTitleText));

	// creating a label for the username input field
	let submitAliasLabel : HTMLElement = createAttachElement("label", mainContainer, grouping, grouping);
	submitAliasLabel.appendChild(document.createTextNode(submitAliasLabelText));

	// creating an input field, as HTML input element for typescript to allow to read from it
	let submitAliasInput : HTMLInputElement = createAttachElement("input", mainContainer, grouping, grouping) as HTMLInputElement;

	// creating a button
	let submitAliasButton : HTMLButtonElement = createAttachElement("button", mainContainer, grouping, grouping) as HTMLButtonElement;
	submitAliasButton.appendChild(document.createTextNode(submitAliasButtonText));

	// attaching a callback function to the button being clicked
	submitAliasButton.addEventListener("click", function ()
	{
		console.log("clicking submit alias button");
		const alias : string = submitAliasInput.value;
		submitAliasInput.value = "";
		console.log(alias);
		if (alias)
		{
			localStorage.setItem(localStorageKeyForAlias, alias);
			displayGamePage();
		}
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
