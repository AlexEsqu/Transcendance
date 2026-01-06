import "./style.css"
import { Router } from './routing/Router';
import { UserState } from './auth/UserState';
import { getConnectionLandingHtml, getConnectionForm, getEmailCheck, initConnectionPageListeners} from './auth/connection';
import { getDashboardPage, initDashboardPageListeners } from "./users/dashboard";
import { getGameHtml, getGameOptionHtml, initGamePageListeners } from "./game/display"
import { getErrorPage } from "./error/error";
import { initNavBarListeners } from "./routing/nav";

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

router.addRoute('/connection', getConnectionLandingHtml);
router.addRoute('/connection/login', getConnectionForm);
router.addRoute('/connection/register', getConnectionForm);
router.addRoute('/connection/emailcheck', getEmailCheck);
router.addRoute('/connection/alias', getConnectionForm);

router.addRoute('/dashboard', getDashboardPage, true);
router.addRoute('/dashboard/rename', getConnectionForm, true);
router.addRoute('/dashboard/avatar', getConnectionForm, true, true);
router.addRoute('/dashboard/email', getConnectionForm, true, true);
router.addRoute('/dashboard/password', getConnectionForm, true, true);

router.addRoute('/game/options', getGameOptionHtml, true);
router.addRoute('/game', getGameHtml, true);

router.addRoute('/error', getErrorPage);

initConnectionPageListeners();
initDashboardPageListeners();
initGamePageListeners();
initNavBarListeners();

router.render();



