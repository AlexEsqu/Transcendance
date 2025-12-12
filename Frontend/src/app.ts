
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

// userState.subscribe((user) =>
// {
// 	console.log('User changed:', user?.getName() || 'No user');

// 	if (user)
// 	{
// 		// User logged in - show nav bar if it doesn't exist
// 		const navExists = document.querySelector('nav');
// 		if (!navExists)
// 			displayNavBar();

// 		// Update nav content
// 		updateNavFromUserData(user);
// 	}
// 	else
// 	{
// 		// User logged out - remove nav and show login
// 		const nav = document.querySelector('nav');
// 		if (nav) nav.remove();
// 		displayAliasQueryPage();
// 	}
// });

if (userState.getUser())
{
	// user logged in, can display game
	goToPage('game');
}
else
{
	// User logged out, show login page
	goToPage('landing');
}

