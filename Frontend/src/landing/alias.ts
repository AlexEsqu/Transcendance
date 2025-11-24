
import { createAttachElement } from "./utils";
import { displayGameWindow } from "./game";

export { displayGreeting, displayAliasQuery, displayAliasDelete }

const submitAliasButtonText = "Submit";
const submitAliasTitleText = "Who are you ?";
const submitAliasLabelText = "Submit a username to start playing.";

const greetingTitleText = (alias: string) => `Welcome, ${alias}!`;
const greetingLabelText = "If you want to delete your alias, click here:";
const greetingButtonText = "Delete Alias";

const localStorageKeyForAlias = "PongAlias"

const aliasPage = document.getElementById("alias-div");

function displayGreeting(name)
{
	// wiping previously available page
	aliasPage.innerHTML = "";
	const id = "greeting";

	// creating a title
	let greetingTitle = createAttachElement("h1", aliasPage, id, null);
	greetingTitle.appendChild(document.createTextNode(greetingTitleText(name)));
}

function displayAliasQuery()
{
	// wiping previously available page
	aliasPage.innerHTML = "";
	const id = "alias-query";

	// creating a title
	let submitAliasTitle = createAttachElement("h1", aliasPage, id, null);
	submitAliasTitle.appendChild(document.createTextNode(submitAliasTitleText));

	// creating a label for the username input field
	let submitAliasLabel = createAttachElement("label", aliasPage, id, null);
	submitAliasLabel.appendChild(document.createTextNode(submitAliasLabelText));

	// creating an input field, as HTML input element for typescript to allow to read from it
	let submitAliasInput = createAttachElement("input", aliasPage, id, null) as HTMLInputElement;

	// creating a button
	let submitAliasButton = createAttachElement("button", aliasPage, id, null);
	submitAliasButton.appendChild(document.createTextNode(submitAliasButtonText));

	// attaching a callback function to the button being clicked
	submitAliasButton.addEventListener("click", function ()
	{
		console.log("clicking submit alias button");
		const alias = submitAliasInput.value;
		submitAliasInput.value = "";
		console.log(alias);
		if (alias)
		{
			localStorage.setItem(localStorageKeyForAlias, alias);
			displayGreeting(alias);
		}
	})
}

function displayAliasDelete()
{
	const id = "delete-alias";

	const gameWindow = createAttachElement("div", document.body, id, null);

	// creating a label for the delete data button
	let greetingLabel = createAttachElement("label", gameWindow, id, null);
	greetingLabel.appendChild(document.createTextNode(greetingLabelText));

	// creating a button
	let greetingButton = createAttachElement("button", gameWindow, id, null);
	greetingButton.appendChild(document.createTextNode(greetingButtonText));

	// adding a callback function to the delete data function
	greetingButton.addEventListener("click", function ()
	{
		console.log("clicking delete button");
		localStorage.removeItem(localStorageKeyForAlias);
		displayAliasQuery();
	})
}
