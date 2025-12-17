
import { displayConnectionPage } from "./connection/connection"
import { displayNavBar, goToPage, updateNavFromUserData } from "./history/nav";
import { displayGameWindow } from "./game/game";
import { GuestUser, RegisteredUser, User } from "./user/User"
import { UserState } from "./connection/UserState";
import "./input.css";
import { RegisterClass } from "@babylonjs/core";

export { userState }

let pageState = '/connection/menu';
window.history.replaceState(pageState, null, pageState);

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
		goToPage('/game/play');
	}

	// User logged out - remove nav and show login
	else
	{
		const nav = document.querySelector('nav');
		if (navExists)
			nav.remove();
		displayConnectionPage();
	}
});
