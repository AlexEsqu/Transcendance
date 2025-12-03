
import { displayAliasQueryPage } from "./landing/alias"
import { displayHeader, displayFooter } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { User, localStorageKeyForGuestUser, localStorageKeyForRegisteredUser } from "./landing/user"
import "./input.css";

export { displayGamePage, User }

// checking if a registered or guest user object is stored in the localStorage, not diplaying the game until they do
const userJSON : string | null = localStorage.getItem(localStorageKeyForRegisteredUser) ?? localStorage.getItem(localStorageKeyForGuestUser);

function displayGamePage() : void
{
	document.body.innerHTML = "";
	const userJSON : string | null = localStorage.getItem(localStorageKeyForRegisteredUser) ?? localStorage.getItem(localStorageKeyForGuestUser);
	const user: User = JSON.parse(userJSON);
	displayHeader(user.name);
	displayGameWindow();
	displayFooter();
}

if (userJSON)
	displayGamePage();
else
	displayAliasQueryPage();


