import { RemapBlock } from "@babylonjs/core";
import { displayAliasQueryPage, displayGuestPage, displayRegisterPage, displayLoginPage } from "./alias";
import { displayDashboardPage, displayDeletePage, displayRenamePage, displayPasswordPage } from "./dashboard"
import { displayGameWindow } from "./game";
import { displayNavBar } from "./nav";

export { renderPageState, pageState}

// initialize history of the website to use back and forward buttons
let pageState = { page: 'landing' };
window.history.replaceState(pageState, null, '');

window.addEventListener('popstate', (event) => {
	if (event.state) {
		renderPageState(event.state);
	}
});

function renderPageState(state: { page: string })
{
	const main = document.querySelector('main');
	if (main)
		main.innerHTML = '';

	switch (state.page) {

		// LOGIN

		case 'landing':
			displayAliasQueryPage();
			break;
		case 'loginAsGuest':
			displayGuestPage();
			break;
		case 'register':
			displayRegisterPage();
			break;
		case 'login':
			displayLoginPage();
			break;

		// GAME

		case 'game':
			displayGameWindow();
			break;

		// SETTINGS

		case 'dashboard':
			displayDashboardPage();
			break;
		case 'password':
			displayPasswordPage();
			break;
		case 'rename':
			displayRenamePage();
			break;
		case 'deleteAccount':
			displayDeletePage();
			break;


		default:
			displayAliasQueryPage();
	}
}
