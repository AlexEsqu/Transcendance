import { UserState } from "../user/UserState";
import { User, RegisteredUser } from "../user/User";

import { getNavBarHtml } from './navSection';
import { apiDomainName } from "../user/UserState";
import { initOAuthCallback } from "../auth/OAuth";
import { getConnectionLandingHtml, getConnectionForm, getEmailCheck, initConnectionPageListeners} from '../auth/connectionPage'
import { getDashboardPage, initDashboardPageListeners } from "../dashboard/dashboardPage";
import { getGameHtml, getGameOptionHtml, initGamePageListeners } from "../game/display";
import { getSettingPage } from "../settings/settingPage";
import { getErrorPage } from "../error/error";

export { Router }
export type { Route, getPageHtmlFunction }

// all page must provide a function to get their HTML content as string
type getPageHtmlFunction = () => string;

// all routes must fit this pattern
interface Route
{
	path: string;
	getPage: getPageHtmlFunction;
	needUser: boolean;
	needRegisteredUser: boolean;
}

class Router
{

	//--------------------------- ATTRIBUTES --------------------------------//

	// available routes
	routes: Route[] = [];

	// current user state
	userState: UserState;

	// container within which to display the html content
	rootElement: HTMLElement;

	// track if navbar is currently initialized
	navbarInitialized: boolean = false;

	//--------------------------- CONSTRUCTORS ------------------------------//

	constructor (userState: UserState, rootSelector: string)
	{
		this.userState = userState;
		this.rootElement = document.querySelector(rootSelector) as HTMLElement;

		if (window.location.pathname === '/oauth/callback') {
			return;
		}

		this.registerRoutes();
		this.initializeFirstPage();

		// plug into back / forward browser buttons to render the last state
		window.addEventListener('popstate', () => this.render());

		// prevent page refresh to stay on single page app
		document.body.removeEventListener('click', this.handleClickInSinglePage);
		document.body.addEventListener('click', this.handleClickInSinglePage);

		// automatically kicks out user if log out, or display dashboard if log in
		this.userState.subscribe((user) => {
			if (!user &&
				(window.location.pathname !== '/connection'
					&& window.location.pathname !== `${apiDomainName}/users/auth/oauth/42`)
				)
				this.navigateTo('/connection');
			if (user && window.location.pathname.includes('/connection'))
				this.navigateTo('/dashboard');
			if (this.navbarInitialized)
				this.renderNavbar(user);
		});
	}

	//---------------------------- GETTER -----------------------------------//

	//--------------------------- SETTER ------------------------------------//


	//-------------------------- NAVIGATION ---------------------------------//


	addRoute(path: string,
			getPage: getPageHtmlFunction,
			needUser = false,
			needRegisteredUser = false)
	{
		this.routes.push({ path, getPage, needUser, needRegisteredUser });
	}

	render()
	{
		const currentPath = window.location.pathname;
		const currentSearch = window.location.search;
		const user = this.userState.getUser();

		const route = this.validateRoute(currentPath);
		const targetPath = route.path;

		this.rootElement.innerHTML = route.getPage();

		this.renderNavbar(user);

		const event = new CustomEvent('pageLoaded', { detail: { path: targetPath, search: currentSearch } });
		console.log("dispatching event:");
		console.log(event);
		document.dispatchEvent(event);
	}

	// uses window.history.pushState, for app navigation (allow back and forth)
	// and path validation to make sure no innaccessible page is accessed
	navigateTo(path: string)
	{
		if (this.isValidPath(path))
		{
			window.history.pushState(null, '', path);
			this.render();
		}
		else
		{
			console.log(`Inaccessible page: ${path}`);
		}
	}

	// uses window.history.replaceState, for app initialization (no back button)
	initializeFirstPage()
	{
		const initialPath = window.location.pathname;
		const initialSearch = window.location.search;

		window.history.replaceState({ detail: { path: initialPath, search: initialSearch }}, '', initialPath);
		this.render();
	}

	handleClickInSinglePage = (event: MouseEvent) =>
	{
		console.log('in handle click redirect')
		const link = (event.target as Element | null)?.closest('[data-link]') as HTMLAnchorElement | null;
		if (link)
		{
			event.preventDefault();
			console.log('in custom routing')
			const href = link.getAttribute('href');
			console.log(href)
			if (href)
				this.navigateTo(href);
		}
	}

	renderNavbar(user: User | null): void
	{
		const navbar = document.getElementById('nav');
		if (!navbar)
		{
			console.log('Navbar element not found');
			return;
		}

		if (user)
		{
			navbar.classList.remove('hidden');

			if (!this.navbarInitialized)
			{
				navbar.innerHTML = getNavBarHtml();
				this.navbarInitialized = true;

				// signals to navbar that it can attach the buttons
				// that have been loaded into the DOM / are in the displayed html
				const navEvent = new CustomEvent('navbarLoaded');
				document.dispatchEvent(navEvent);
			}
		}
		else
		{
			navbar.classList.add('hidden');
			navbar.innerHTML = '';
			this.navbarInitialized = false;
		}
	}

	//-------------------------- UTILITIES ----------------------------------//

	getDefaultPath(user: User | null): string
	{
		return user ? '/dashboard' : '/connection';
	}

	getDefaultRoute(user : User | null): Route
	{
		const defaultRoute = this.routes.find(route => route.path === this.getDefaultPath(user));
		if (!defaultRoute)
			throw new Error('Default Page not found')
		return defaultRoute;
	}

	getRoute(path : string): Route | undefined
	{
		return this.routes.find(route => route.path === path);
	}

	isAccessibleRoute(route: Route, user: User | null): boolean
	{
		if (!user && route.needUser)
			return false;
		if (user && !route.needUser)
			return false;
		if (!(user instanceof RegisteredUser) && route.needRegisteredUser)
			return false;
		return true;
	}

	isValidPath(path: string): boolean
	{
		const user = this.userState.getUser();
		let currentRoute = this.routes.find(route => route.path === path);
		if (!currentRoute || !this.isAccessibleRoute(currentRoute, user))
			return false;
		return true;
	}

	validateRoute(path: string): Route
	{
		const user = this.userState.getUser();
		let currentRoute = this.routes.find(route => route.path === path);
		if (!currentRoute || !this.isAccessibleRoute(currentRoute, user))
			currentRoute = this.getDefaultRoute(user);
		return currentRoute;
	}

	registerRoutes()
	{
		this.addRoute('/connection', getConnectionLandingHtml);
		this.addRoute('/connection/login', getConnectionForm);
		this.addRoute('/connection/register', getConnectionForm);
		this.addRoute('/connection/emailcheck', getEmailCheck);
		this.addRoute('/connection/alias', getConnectionForm);

		this.addRoute('/dashboard', getDashboardPage, true);
		this.addRoute('/settings', getSettingPage, true);

		this.addRoute('/game/options', getGameOptionHtml, true);
		this.addRoute('/game', getGameHtml, true);

		this.addRoute('/error', getErrorPage);

		this.addRoute('/oauth/callback', () => {
			initOAuthCallback();
			return '<div id="oauth-callback"></div>';
		}, false, false);
	}

}
