
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { User, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser } from "./landing/user"
import "./input.css";

export { displayGamePage, User }

let pageState = { page: 'welcome' };
window.history.replaceState(pageState, null, '#welcome');

// checking if a registered or guest user object is stored in the localStorage, not diplaying the game until they do
const userJSON : string | null = localStorage.getItem(localStorageKeyForRegisteredUser) ?? localStorage.getItem(localStorageKeyForGuestUser);

function displayGamePage() : void
{
	document.body.innerHTML = "";
	const userJSON : string | null = localStorage.getItem(localStorageKeyForRegisteredUser) ?? localStorage.getItem(localStorageKeyForGuestUser);
	const user: User = JSON.parse(userJSON);
	displayNavBar();
	displayGameWindow();
}

if (userJSON)
	displayGamePage();
else
	displayAliasQueryPage();


