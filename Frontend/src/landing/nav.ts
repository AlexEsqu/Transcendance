import navHTML from "../pages/nav.html"
import { displayAliasQueryPage, displayUserPage } from "./alias"
import { renderPageState } from "./history"
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage } from "./user"

export { displayNavBar}

async function displayNavBar()
{
	const user : User = await getUserFromLocalStorage();
	document.body.insertAdjacentHTML("beforeend", navHTML.replace('USERNAME', user.name));

	const avatarImage = document.getElementById('user-avatar') as HTMLImageElement;
	avatarImage.src = user.avatarPath;

	const logoutButton = document.getElementById('logout-btn');
	logoutButton.addEventListener('click', () => {
		user.logoutUser();
		displayAliasQueryPage();
	})

	const deleteUserButton = document.getElementById('delete-user-btn');
	deleteUserButton.addEventListener('click', () => {
		user.deleteAccount();
		displayAliasQueryPage();
	})

	const settingUserButton = document.getElementById('user-info-btn');
	settingUserButton.addEventListener('click', () => {
		let pageState = { page: 'user'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	})
}
