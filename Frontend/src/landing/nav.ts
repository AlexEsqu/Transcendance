import navHTML from "../pages/nav.html"
import { displayAliasQueryPage, displayUserPage } from "./alias"
import { renderPageState } from "./history"
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage } from "./User"
import { userObject } from "../app"

export { displayNavBar}

async function displayNavBar()
{
	console.log(`In display nav bar, user is ${userObject}`)
	document.body.insertAdjacentHTML("beforeend", navHTML.replace('USERNAME', userObject.name));

	const avatarImage = document.getElementById('user-avatar') as HTMLImageElement;
	avatarImage.src = userObject.avatarPath;

	const logoutButton = document.getElementById('logout-btn');
	logoutButton.addEventListener('click', () => {
		userObject.logoutUser();
		let pageState = { page: 'welcome'};
		window.history.pushState(pageState, '', `#${pageState.page}`);
		renderPageState(pageState);
	})

	const deleteUserButton = document.getElementById('delete-user-btn');
	deleteUserButton.addEventListener('click', () => {
		userObject.deleteAccount();
		let pageState = { page: 'welcome'};
		window.history.pushState(pageState, '', `#${pageState.page}`);
		renderPageState(pageState);
	})

	const settingUserButton = document.getElementById('user-info-btn');
	settingUserButton.addEventListener('click', () => {
		let pageState = { page: 'user'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	})
}
