import footerHTML from "../pages/footer.html"
import headerHTML from "../pages/header.html"
import navHTML from "../pages/nav.html"
import { displayAliasQueryPage } from "./alias"
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser } from "./user"

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
	// document.body.insertAdjacentHTML("beforeend", headerHTML.replace('WISELY', name))
	displayNavBar()
}

async function deleteUserData() : Promise<void>
{
	const user : User = await getUserFromLocalStorage()
	console.log(user);
	user.logoutUser();
}

async function displayNavBar()
{
	const user : User = await getUserFromLocalStorage();
	document.body.insertAdjacentHTML("beforeend", navHTML.replace('USERNAME', user.name))

	const logoutButton = document.getElementById('logout-btn');
	logoutButton.addEventListener('click', () => {
		user.logoutUser();
		displayAliasQueryPage();
	})

	const deleteUserButton = document.getElementById('delete-user-btn');
	deleteUserButton.addEventListener('click', () => {
		user.deleteUser();
		displayAliasQueryPage();
	})
}
