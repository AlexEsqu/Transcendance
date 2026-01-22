import { UserState } from "../user/UserState";
import { User, RegisteredUser } from "../user/User";

import { getNavBarHtml } from './navSection';
import { apiDomainName } from "../user/UserState";
import { getConnectionPage, getGuestForm, getLoginForm, getRegisterForm, onAliasLoaded, onLoginLoaded, onRegisterLoaded } from '../auth/connectionPage'
import { getDashboardPage, onDashboardLoaded, cleanupDashboardPage, getPolicyPage } from "../dashboard/dashboardPage";
import { getGamePage, onGameLoaded, cleanGamePage } from "../game/display";
import { getSettingPage, onSettingsLoaded, cleanupSettingPage } from "../settings/settingPage";
import { getErrorPage, openErrorModal } from "../error/error";

export { Router }
export type { Route, getPageHtmlFunction }

type getPageHtmlFunction = () => string;
type initPageJSFunction = (() => void) | (() => Promise<void>);
type cleanPageFunction = (() => void) | (() => Promise<void>);

// all routes must fit this pattern
interface Route
{
	// mandatory
	path: string;
	getPage: getPageHtmlFunction; // all routes must provide a function to get their HTML content as string

	// optional
	initPage: initPageJSFunction; // routes may provide a function to get the JS to activate the HTML content
	cleanPage: cleanPageFunction; // routes may provide a function to execute when the user leaves the page
	needUser: boolean; // routes may set a needUser boolean to true if a page's access is restricted
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

	// function stored to be executed before next render
	cleanUp: cleanPageFunction | null = null;

	//--------------------------- CONSTRUCTORS ------------------------------//

	constructor (userState: UserState, rootSelector: string)
	{
		this.userState = userState;
		this.rootElement = document.querySelector(rootSelector) as HTMLElement;

		this.registerRoutes();

		if (window.location.pathname === '/oauth/callback') {
			this.render();
			return;
		}

		this.initializeFirstPage();

		// plug into back / forward browser buttons to render the last state
		window.addEventListener('popstate', () => this.render());

		// prevent page refresh when changing page to stay on single page app
		document.body.removeEventListener('click', this.handleClickInSinglePage);
		document.body.addEventListener('click', this.handleClickInSinglePage);

		// automatically kicks out user if log out, or display dashboard if log in
		this.userState.subscribe((user) => {
			if (!user
				&& (window.location.pathname !== '/connection'
				&& window.location.pathname !== `${apiDomainName}/users/auth/oauth/42`))
				this.navigateTo('/connection');
			if (user && window.location.pathname.includes('/connection') && window.location.pathname !== '/oauth/callback')
				this.navigateTo('/dashboard');
			if (this.navbarInitialized)
				this.renderNavbar(user);
		});
	}

	//---------------------------- GETTER -----------------------------------//

	//--------------------------- SETTER ------------------------------------//


	//-------------------------- NAVIGATION ---------------------------------//


	addRoute(
		path: string,
		getPage: getPageHtmlFunction,
		initPage: initPageJSFunction = () => {},
		cleanPage: cleanPageFunction = () => {},
		needUser:boolean = false
	)
	{
		this.routes.push({ path, getPage, initPage, cleanPage, needUser });
	}

	async render()
	{
		await this.executeLastPageCleanup();

		const currentPath = window.location.pathname;
		const currentSearch = window.location.search;
		const user = this.userState.getUser();

		const route = this.validateRoute(currentPath);
		const targetPath = route.path;

		this.renderNavbar(user);

		this.rootElement.innerHTML = route.getPage();
		await route.initPage();

		this.storeCleanupForNextRender(route);

		// warn all subscribed that a new page has loaded
		this.notifyThatPageHasLoaded(targetPath, currentSearch);
	}

	// uses window.history.pushState, for app navigation (allow back and forth)
	// and path validation to make sure no innaccessible page is accessed
	async navigateTo(path: string)
	{
		try
		{
			if (this.isValidPath(path))
			{
				window.history.pushState(null, '', path);
				await this.render();
			}
			else
				throw new Error(`Inaccessible page: ${path}`);
		}
		catch (err)
		{
			if (err instanceof Error)
				openErrorModal(err);
		}
	}

	// uses window.history.replaceState, for app initialization (no back button)
	async initializeFirstPage()
	{
		const initialPath = window.location.pathname;
		const initialSearch = window.location.search;

		window.history.replaceState({ detail: { path: initialPath, search: initialSearch }}, '', initialPath);
		await this.render();
	}

	handleClickInSinglePage = (event: MouseEvent) =>
	{
		const link = (event.target as Element | null)?.closest('[data-link]') as HTMLAnchorElement | null;
		if (link)
		{
			event.preventDefault();
			const href = link.getAttribute('href');
			if (href)
				this.navigateTo(href);
		}
	}

	renderNavbar(user: User | null): void
	{
		const navbar = document.getElementById('nav');
		if (!navbar)
			throw new Error('Navbar element is not found');

		if (user)
		{
			navbar.classList.remove('hidden');
			navbar.innerHTML = getNavBarHtml();
			this.navbarInitialized = true;

			// signals to navbar that it can attach the buttons
			// that have been loaded into the DOM / are in the displayed html
			const navEvent = new CustomEvent('navbarLoaded');
			document.dispatchEvent(navEvent);
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
		if (user && !route.needUser && route.path !== '/error' && route.path !== '/policy')
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
		// AUTHENTICATION, requires no user to be registered
		this.addRoute('/connection', getConnectionPage);
		this.addRoute('/connection/login', getLoginForm, onLoginLoaded);
		this.addRoute('/connection/register', getRegisterForm, onRegisterLoaded);
		this.addRoute('/connection/alias', getGuestForm, onAliasLoaded);

		// CONTENT, requires user to be registered or guests
		this.addRoute('/dashboard', getDashboardPage, onDashboardLoaded, cleanupDashboardPage, true);
		this.addRoute('/settings', getSettingPage, onSettingsLoaded, cleanupSettingPage, true);
		this.addRoute('/game', getGamePage, onGameLoaded, cleanGamePage, true);
		this.addRoute('/error', getErrorPage);
		this.addRoute('/policy', getPolicyPage);

		// SPECIAL CASE for oauth callback
		this.addRoute('/oauth/callback', () => {
			return '<div id="oauth-callback"></div>';
		}, this.userState.oAuth.handleRedirectCallback, ()=>{}, false);
	}

	async executeLastPageCleanup(): Promise<void>
	{
		if (this.cleanUp)
		{
			await this.cleanUp();
			this.cleanUp = null;
		}
	}

	storeCleanupForNextRender(route: Route): void
	{
		this.cleanUp = route.cleanPage;
	}

	notifyThatPageHasLoaded(targetPath: string, currentSearch: string): void
	{
		const event = new CustomEvent('pageLoaded', { detail: { path: targetPath, search: currentSearch } });
		document.dispatchEvent(event);
	}
}
