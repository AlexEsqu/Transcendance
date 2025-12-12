
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { GuestUser, RegisteredUser, User } from "./landing/User"
import { UserState } from "./landing/UserState";
import "./input.css";
import { RegisterClass } from "@babylonjs/core";

export { userState }

let pageState = { page: 'welcome' };
window.history.replaceState(pageState, null, '#welcome');

const userState = UserState.getInstance();

console.log(`User is :`);
console.log(userState)

userState.subscribe((user) =>
{
	console.log('User changed:', user?.getName() || 'No user');

	if (user)
	{
		// user logged in, can display game
		document.body.innerHTML = "";
		displayNavBar();
	}
	else
	{
		// User logged out, show login page
		displayAliasQueryPage();
	}
});

if (userState.getUser())
{
	displayGameWindow();
}
else
{
	displayAliasQueryPage();
}

