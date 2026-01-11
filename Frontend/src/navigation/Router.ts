import { UserState } from "../user/UserState";
import { User, RegisteredUser } from "../user/User";

import { getNavBarHtml } from './navSection';
import { apiDomainName } from "../user/UserState";

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
	private routes: Route[] = [];

	// current user state
	private userState: UserState;

	// container within which to display the html content
	private rootElement: HTMLElement;

	// track if navbar is currently initialized
	private navbarInitialized: boolean = false;

	//--------------------------- CONSTRUCTORS ------------------------------//

	constructor (userState: UserState, rootSelector: string)
	{
		this.userState = userState;
		this.rootElement = document.querySelector(rootSelector) as HTMLElement;

		if (window.location.pathname === '/oauth/callback') {
			return;
		}

		this.initializeHistory();

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

	navigateTo(path: string)
	{
		console.log(`navigating to ${path}`)
		window.history.pushState(null, '', path);
		this.render();
	}

	render()
	{
		const currentPath = window.location.pathname;
		const currentSearch = window.location.search;
		const user = this.userState.getUser();

		console.log(`initial route is ${currentPath} with query ${currentSearch}`);

		let route = this.routes.find(route => route.path === currentPath);

		// if no route found, defaulting to the connection page
		if (!route || !route.path)
		{
			this.redirectToDefaultPage();
			return;
		}

		// if route requires no user, defaulting to the dashboard page
		if (!route.needUser && user)
		{
			this.redirectToDefaultPage();
			return;
		}

		// if route requires a user, defaulting to the connection page
		if (route.needUser && !user)
		{
			this.redirectToDefaultPage();
			return;
		}

		// if route requires a registerd user, defaulting to the connection page
		if (route && route.needRegisteredUser && !(user instanceof RegisteredUser))
		{
			this.redirectToDefaultPage();
			return;
		}

		// // if the user is currently on a game page, warn them that leaving will end game
		// if (user && currentPath.includes('/game'))
		// {
		// 	const confirmed = window.confirm(
		// 		'Leaving the game page will end the game.\n Are you sure you want to continue?'
		// 	);
		// 	if (!confirmed)
		// 		return;
		// }

		if (!route)
			return;

		console.log(route && `corrected route is ${route.path} with query ${currentSearch}`)

		this.rootElement.innerHTML = route.getPage();

		this.renderNavbar(user);

		const event = new CustomEvent('pageLoaded', { detail: { path: currentPath, search: currentSearch } });
		console.log("dispatching event:");
		console.log(event);
		document.dispatchEvent(event);
	}


	//-------------------------- UTILITIES ----------------------------------//

	private handleClickInSinglePage = (event: MouseEvent) =>
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

	private initializeHistory()
	{
		const initialPath = window.location.pathname;
		const initialSearch = window.location.search;

		if (initialPath === '/oauth/callback') {
			window.history.replaceState({ path: initialPath }, '', initialPath);
			return;
		}

		const hasHistory = window.history.state && initialPath != '/'
			&& initialPath != '' && initialPath != '/connection'

		let targetPath = '/connection';

		console.log(this.userState.getUser());

		if (this.userState.getUser())
		{
			if (hasHistory)
				targetPath = initialPath + initialSearch;
			else
				targetPath = '/dashboard';
		}

		console.log(`going to ${targetPath}`);

		window.history.replaceState({ path: targetPath }, '', targetPath);
	}

	private redirectToDefaultPage()
	{
		const user = this.userState.getUser();
		window.history.replaceState(null, '', (user ? '/dashboard' : '/connection'));
		this.render();
	}

	private renderNavbar(user: User | null): void
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
}
