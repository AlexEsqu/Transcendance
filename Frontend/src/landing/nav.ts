import footerHTML from "../pages/footer.html"
import headerHTML from "../pages/header.html"
import navHTML from "../pages/nav.html"
import { displayAliasQueryPage, displayUserSettingPage } from "./alias"
import { renderPageState } from "./history"
import { User, GuestUser, RegisteredUser, getUserFromLocalStorage } from "./user"

export { displayNavBar}

async function displayNavBar()
{
	const user : User = await getUserFromLocalStorage();
	document.body.insertAdjacentHTML("beforeend", navHTML.replace('USERNAME', user.name))

	const logoutButton = document.getElementById('logout-btn');
	logoutButton.addEventListener('click', () => {
		user.logoutUser();
		displayAliasQueryPage();
	})

	const deleteUserButton = document.getElementById('delete-user-btn');
	deleteUserButton.addEventListener('click', () => {
		user.deleteUser();
		displayAliasQueryPage();
	})

	const settingUserButton = document.getElementById('user-info-btn');
	settingUserButton.addEventListener('click', () => {
		let pageState = { page: 'setting'};
		window.history.pushState(pageState, '', '#' + pageState.page);
		renderPageState(pageState);
	})
}
