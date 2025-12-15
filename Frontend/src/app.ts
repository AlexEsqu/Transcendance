
import { displayAliasQueryPage } from "./landing/alias"
import { displayNavBar, goToPage, updateNavFromUserData } from "./landing/nav";
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
	const navExists = document.querySelector('nav');

	// User logged in - show nav bar if it doesn't exist
	if (user)
	{
		if (!navExists)
			displayNavBar();
		updateNavFromUserData(user);
	}

	// User logged out - remove nav and show login
	else
	{
		const nav = document.querySelector('nav');
		if (navExists)
			nav.remove();
		displayAliasQueryPage();
	}
});
