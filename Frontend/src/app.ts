
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { GuestUser, RegisteredUser, User, getUserFromLocalStorage } from "./landing/user"
import "./input.css";
import { RegisterClass } from "@babylonjs/core";

export { displayGamePage, userObject }

let pageState = { page: 'welcome' };
window.history.replaceState(pageState, null, '#welcome');

// checking if a registered or guest user object is stored in the localStorage, not diplaying the game until they do
let guestObject : User = new GuestUser('');
let userObject : User = new RegisteredUser('');

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


