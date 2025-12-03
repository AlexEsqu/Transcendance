import footerHTML from "../pages/footer.html"
import headerHTML from "../pages/header.html"
import { displayAliasQueryPage } from "./alias"
import { User, GuestUser, RegisteredUser, getCurrentUser, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser } from "./user"

export {displayFooter, displayHeader}

// adds a footer to the document body
function displayFooter() : void
{
	document.body.insertAdjacentHTML("beforeend", footerHTML);

	const deleteAliasButton = document.getElementById('delete-name-btn')

	// adding a callback function to the delete data function
	deleteAliasButton.addEventListener("click", function ()
	{
		console.log("clicking delete button");
		deleteUserData()
	})
}

// adds a header to the document body, replace name into it
function displayHeader(name : string) : void
{
	// document.body.innerHTML += headerHTML.replace('WISELY', name)
	document.body.insertAdjacentHTML("beforeend", headerHTML.replace('WISELY', name))
}

function deleteUserData() : void
{
	const userJSON : string | null = localStorage.getItem(localStorageKeyForRegisteredUser) ?? localStorage.getItem(localStorageKeyForGuestUser);
	const user : User = JSON.parse(userJSON);
	user.logoutUser();
	displayAliasQueryPage();
}
