import { RemapBlock } from "@babylonjs/core";
import { displayUserPage, displayAliasQueryPage, displayGuestPage, displayRegisterPage, displayLoginPage, displayGamePage } from "./alias";
import { displayDeletePage, displayRenamePage, displayPasswordPage } from "./dashboard"
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
			displayGamePage();
			break;
		case 'user':
			displayUserPage();
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
