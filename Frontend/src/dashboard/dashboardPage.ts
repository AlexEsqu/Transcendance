import { userState, router } from "../app"
import { showFriend, showUsers } from "./socialSection";
import { RegisteredUser } from "../user/User";
import type { Subscriber } from "../user/UserState";
import { displayMatchHistory } from "./graphSection";

import dashboardHtml from "../html/dashboard.html?raw";

export { getDashboardPage, onDashboardLoaded, showRegisteredUserOptions, cleanupDashboardPage }

// variable to hold current listener functions

let currentFriendsListener: Subscriber | null = null;
let currentUsersListener: Subscriber | null = null;

// Getting base html for the pages

function getDashboardPage(): string
{
	return dashboardHtml;
}


async function onDashboardLoaded(): Promise<void>
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;

	currentFriendsListener = () => showFriend();
	currentUsersListener = () => showUsers();

	if (isRegistered)
	{
		showRegisteredUserOptions(user);
		userState.subscribe(currentFriendsListener);
		displayMatchHistory();
	}

	userState.subscribe(currentUsersListener);
}

function showRegisteredUserOptions(user : RegisteredUser)
{
	document.querySelectorAll('.need-registered-user').forEach(el =>
		{
			(el as HTMLElement).style.display = 'flex';
		}
	);

	document.querySelectorAll('.need-registered-user-btn').forEach(el =>
		{
			const btn = el as HTMLButtonElement;
			btn.disabled = false;
			btn.removeAttribute('title');
		}
	);
}

function cleanupDashboardPage()
{
	if (currentFriendsListener)
	{
		userState.unsubscribe(currentFriendsListener);
		currentFriendsListener = null;
	}
	if (currentUsersListener)
	{
		userState.unsubscribe(currentUsersListener);
		currentUsersListener = null;
	}

}
