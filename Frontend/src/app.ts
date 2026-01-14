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

router.addRoute('/connection', getConnectionLandingHtml);
router.addRoute('/connection/login', getConnectionForm);
router.addRoute('/connection/register', getConnectionForm);
router.addRoute('/connection/emailcheck', getEmailCheck);
router.addRoute('/connection/alias', getConnectionForm);

router.addRoute('/dashboard', getDashboardPage, true);
router.addRoute('/settings', getSettingPage, true);

router.addRoute('/game/options', getGameOptionHtml, true);
router.addRoute('/game', getGameHtml, true);

router.addRoute('/error', getErrorPage);

router.addRoute('/oauth/callback', () => {
	initOAuthCallback();
	return '<div id="oauth-callback"></div>';
}, false, false);

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



