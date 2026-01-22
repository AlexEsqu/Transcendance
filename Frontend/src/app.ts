import "./style.css"
import { Router } from './navigation/Router';
import { UserState } from './user/UserState';
import { initNavBarListeners} from "./navigation/navSection"

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

initNavBarListeners();
await router.render();


