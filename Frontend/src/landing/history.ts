import { RemapBlock } from "@babylonjs/core";
import { displayAliasQueryPage, displayGuestPage, displayRegisterPage, displayLoginPage } from "./alias";
import { displayDeletePage, displayRenamePage, displayPasswordPage } from "./dashboard"
import { displayGameWindow } from "./game";

export { renderPageState, pageState}

// initialize history of the website to use back and forward buttons
let pageState = { page: 'welcome' };
window.history.replaceState(pageState, null, '');

window.addEventListener('popstate', (event) => {
	if (event.state) {
		renderPageState(event.state);
	}
});

function renderPageState(state: { page: string }) {
	switch (state.page) {
		case 'welcome':
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
		case 'game':
			displayGameWindow();
			break;
		// case 'user':
		// 	displayUserPage();
		// 	break;
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
