// import { RemapBlock } from "@babylonjs/core";
// import { displayDashboardPage, displayDeletePage, displayRenamePage, displayPasswordPage } from "../users/dashboard"
// import { displayGameWindow } from "../game/game";
// import { getNavBarHtml } from "./nav";
// import { pageIndex } from "./pages";

// export { renderPageState, pageState}

// // initialize history of the website to use back and forward buttons
// let pageState = pageIndex.connection.login;
// window.history.replaceState(pageState, null, pageState);

// function renderPageState(state: string )
// {
// 	const main = document.querySelector('main');
// 	if (main)
// 		main.innerHTML = '';

// 	switch (state) {

// 		// LOGIN

// 		case '/connection/landing':
// 			displayConnectionPage();
// 			break;
// 		case '/connection/alias':
// 			displayGuestPage();
// 			break;
// 		case '/connection/register':
// 			displayRegisterPage();
// 			break;
// 		case '/connection/login':
// 			displayLoginPage();
// 			break;

// 		// GAME

// 		case '/game/play':
// 			displayGameWindow();
// 			break;

// 		// SETTINGS

// 		case '/settings/dashboard':
// 			displayDashboardPage();
// 			break;
// 		case '/settings/password':
// 			displayPasswordPage();
// 			break;
// 		case '/settings/rename':
// 			displayRenamePage();
// 			break;
// 		case '/settings/deleteAccount':
// 			displayDeletePage();
// 			break;


// 		default:
// 			displayConnectionPage();
// 	}
// }
