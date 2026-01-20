import "./style.css"
import { Router } from './navigation/Router';
import { UserState } from './user/UserState';

export { userState, router };

const userState = UserState.getInstance();
const router = new Router(userState, '#main');

router.render();


