
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { User, getUserFromLocalStorage } from "./landing/user"
import "./input.css";

export { displayGamePage, userObject }

let pageState = { page: 'welcome' };
window.history.replaceState(pageState, null, '#welcome');

// checking if a registered or guest user object is stored in the localStorage, not diplaying the game until they do
let userObject : User | null = await getUserFromLocalStorage();

console.log(userObject);

function displayGamePage() : void
{
	document.body.innerHTML = "";
	displayNavBar();
	displayGameWindow();
}

if (userObject)
	displayGamePage();
else
	displayAliasQueryPage();


