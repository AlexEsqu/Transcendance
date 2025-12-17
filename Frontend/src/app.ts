import "./style.css"
import { Router } from './routing/Router';
import { UserState } from './auth/UserState';
import {
	getConnectionLandingHtml,
	getConnectionLoginHtml,
	getConnectionRegisterHtml,
	getConnectionAliasHtml,
	initConnectionPageListeners
	} from './auth/connection';

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

router.addRoute('/connection', getConnectionLandingHtml);
router.addRoute('/connection/login', getConnectionLoginHtml);
router.addRoute('/connection/register', getConnectionRegisterHtml);
router.addRoute('/connection/alias', getConnectionAliasHtml);

initConnectionPageListeners();

router.render();



