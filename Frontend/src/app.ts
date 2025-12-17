import "./style.css"
import { Router } from './routing/Router';
import { UserState } from './auth/UserState';
import {
	getConnectionLandingHtml,
	getConnectionForm,
	initConnectionPageListeners
	} from './auth/connection';

import { getDashboardPage, getSettingForm } from "./users/dashboard";

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

router.addRoute('/connection', getConnectionLandingHtml);
router.addRoute('/connection/login', getConnectionForm);
router.addRoute('/connection/register', getConnectionForm);
router.addRoute('/connection/alias', getConnectionForm);
router.addRoute('/settings', getDashboardPage);
router.addRoute('/settings/rename', getSettingForm);
router.addRoute('/settings/avatar', getSettingForm);

initConnectionPageListeners();

router.render();



