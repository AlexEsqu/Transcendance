import "./style.css"
import { Router } from './routing/Router';
import { UserState } from './auth/UserState';
import { getConnectionLandingHtml, getConnectionForm, initConnectionPageListeners} from './auth/connection';
import { getDashboardPage, getSettingForm, initSettingPageListeners } from "./users/dashboard";
import { getGameHtml, getGameOptionHtml, initGamePageListeners } from "./game/display"
import { getErrorPage } from "./error/error";

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

router.addRoute('/connection', getConnectionLandingHtml);
router.addRoute('/connection/login', getConnectionForm);
router.addRoute('/connection/register', getConnectionForm);
router.addRoute('/connection/alias', getConnectionForm);

router.addRoute('/settings', getDashboardPage, true);
router.addRoute('/settings/rename', getSettingForm, true);
router.addRoute('/settings/avatar', getSettingForm, true, true);
router.addRoute('/settings/email', getSettingForm, true, true);
router.addRoute('/settings/password', getSettingForm, true, true);

router.addRoute('/game/options', getGameOptionHtml, true);
router.addRoute('/game', getGameHtml, true);

router.addRoute('/error', getErrorPage);

initConnectionPageListeners();
initSettingPageListeners();
initGamePageListeners();

router.render();



