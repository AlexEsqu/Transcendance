import "./style.css"
import { Router } from './navigation/Router';
import { UserState } from './user/UserState';
import { initConnectionPageListeners} from './auth/connectionPage';
import { initDashboardPageListeners } from "./dashboard/dashboardPage";
import { initGamePageListeners } from "./game/display";
import { initNavBarListeners } from "./navigation/navSection";
import { initOAuthCallback } from "./auth/OAuth";

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');
const isOAuthPopup = window.location.pathname === '/oauth/callback';

if (!isOAuthPopup)
{
	initConnectionPageListeners();
	initDashboardPageListeners();
	initGamePageListeners();
	initNavBarListeners();
	router.render();
}
else
{
	initOAuthCallback();
}



