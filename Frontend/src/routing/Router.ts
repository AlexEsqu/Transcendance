import { UserState } from "../auth/UserState";
import { User, RegisteredUser } from "../users/User";

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
	private routes: Route[] = []; // available routes
	private userState: UserState; // current user state
	private rootElement: HTMLElement; // place where to display the html page

	constructor (userState: UserState, rootSelector: string)
	{
		this.userState = userState;
		this.rootElement = document.querySelector(rootSelector) as HTMLElement;

		this.initializeHistory();

		// plug into back / forward browser buttons to render the last state
		window.addEventListener('popstate', () => this.render());

		// prevent page refresh to stay on single page app
		document.body.addEventListener('click', this.handleClickInSinglePage);
	}

	addRoute(path: string, getPage: getPageHtmlFunction, needUser = false, needRegisteredUser = false)
	{
		this.routes.push({ path, getPage, needUser, needRegisteredUser });
	}

	navigateTo(path: string)
	{
		window.history.pushState(null, '', path);
		this.render();
	}

	render()
	{
		const currentPath = window.location.pathname;
		let route = this.routes.find(route => route.path === currentPath);

		// if no route found, defaulting to the connection page
		if (!route)
			route = this.routes.find(route => route.path === '/connection');

		const user = this.userState.getUser();

		// if route requires a user, defaulting to the connection page
		if (route && route.needUser && !user)
		{
			window.history.replaceState(null, '', '/connection');
			this.render();
			return;
		}

		// if route requires a registerd user, defaulting to the connection page
		if (route && route.needRegisteredUser && !(user instanceof RegisteredUser))
		{
			window.history.replaceState(null, '', '/connection');
			this.render();
			return;
		}

		if (!route)
			return;

		this.rootElement.innerHTML = route.getPage();

		const event = new CustomEvent('pageLoaded', { detail: route.path });
		document.dispatchEvent(event);
	}


	private handleClickInSinglePage = (event: MouseEvent) =>
	{
		const link = (event.target as Element | null)?.closest('a[data-link]') as HTMLAnchorElement | null;
		if (!link)
			return;

		const href = link.getAttribute('href');

		if (href)
		{
			event.preventDefault();
			this.navigateTo(href);
		}
	}

	private initializeHistory()
	{
		const initialPath = window.location.pathname;
		const shouldDefault = initialPath === '/' || initialPath === '' || !window.history.state;

		const targetPath = shouldDefault ? '/connection' : initialPath;
		window.history.replaceState({ path: targetPath }, '', targetPath);
	}
}
