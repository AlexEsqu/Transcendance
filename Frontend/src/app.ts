
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar, goToPage } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import { GuestUser, RegisteredUser, User } from "./landing/User"
import { UserState } from "./landing/UserState";
import "./input.css";
import { RegisterClass } from "@babylonjs/core";

export { userState }

let pageState = { page: 'landing' };
window.history.replaceState(pageState, null, '#landing');

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
	// user logged in, can display game
	document.body.innerHTML = "";
	displayNavBar();
	displayGameWindow();
}
else
{
	// User logged out, show login page
	displayAliasQueryPage();
}

