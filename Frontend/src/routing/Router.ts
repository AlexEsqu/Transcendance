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

	//--------------------------- ATTRIBUTES --------------------------------//

	// available routes
	private routes: Route[] = [];

	// current user state
	private userState: UserState;

	// container within which to display the html content
	private rootElement: HTMLElement;

	//--------------------------- CONSTRUCTORS ------------------------------//

	constructor (userState: UserState, rootSelector: string)
	{
		this.userState = userState;
		this.rootElement = document.querySelector(rootSelector) as HTMLElement;

		this.initializeHistory();

		// plug into back / forward browser buttons to render the last state
		window.addEventListener('popstate', () => this.render());

		// prevent page refresh to stay on single page app
		document.body.removeEventListener('click', this.handleClickInSinglePage);
		document.body.addEventListener('click', this.handleClickInSinglePage);
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
		let route = this.routes.find(route => route.path === currentPath);

		console.log(route && `route is ${route.path}`)

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

		console.log(route && `corrected route is ${route.path}`)

		this.rootElement.innerHTML = route.getPage();

		const event = new CustomEvent('pageLoaded', { detail: route.path });
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
		const hasHistory = window.history.state && initialPath != '/'
			&& initialPath != '' && initialPath != '/connection'

		let targetPath = '/connection';

		console.log(this.userState.getUser());

		if (this.userState.getUser())
		{
			if (hasHistory)
				targetPath = initialPath;
			else
				targetPath = '/settings';
		}

		console.log(`going to ${targetPath}`);

		window.history.replaceState({ path: targetPath }, '', targetPath);
	}
}
