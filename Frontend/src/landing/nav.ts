import footerHTML from "../pages/footer.html"
import headerHTML from "../pages/header.html"
import { displayAliasQueryPage, localStorageKeyForAlias } from "./alias"

export {displayFooter, displayHeader}

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

function displayHeader(name : string) : void
{
	document.body.innerHTML += headerHTML.replace('WISELY', name)
}
