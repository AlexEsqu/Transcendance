import { displayConnectionPage, displayGuestPage, displayRegisterPage, displayLoginPage } from "../auth/connection";
import { displayDashboardPage, displayDeletePage, displayRenamePage, displayPasswordPage } from "../users/dashboard"
import { displayGameWindow } from "../game/game";

type Page =
{
	path: string,
}

export const pageIndex = {
	connection: {
        menu: '/connection/menu',
        login: '/connection/login',
        register: '/connection/register',
        alias: '/connection/alias',
    },
    game: {
        play: '/game/play',
    },
    settings: {
        dashboard: '/settings/dashboard',
        password: '/settings/password',
        rename: '/settings/rename',
        deleteAccount: '/settings/deleteAccount',
    },
}
