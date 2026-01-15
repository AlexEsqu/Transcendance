import "./style.css"
import { Router } from './navigation/Router';
import { UserState } from './user/UserState';
import { getConnectionLandingHtml, getConnectionForm, getEmailCheck, initConnectionPageListeners} from './auth/connectionPage';
import { getDashboardPage, initDashboardPageListeners } from "./dashboard/dashboardPage";
import { getGameHtml, getGameOptionHtml, initGamePageListeners } from "./game/display";
import { getSettingPage } from "./settings/settingPage";
import { getErrorPage } from "./error/error";
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



