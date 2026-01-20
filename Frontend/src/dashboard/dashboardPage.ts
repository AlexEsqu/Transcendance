import { userState, router } from "../app"
import { showFriend, showUsers } from "./socialSection";
import { RegisteredUser } from "../user/User";
import type { Subscriber } from "../user/UserState";
import type { User } from "../user/User";
import { displayMatchHistory } from "./graphSection";
import { onSettingsLoaded } from "../settings/settingPage";

import dashboardHtml from "../html/dashboard.html?raw";

export { getDashboardPage, initDashboardPageListeners, showRegisteredUserOptions }

// variable to hold current listener functions

let currentFriendsListener: Subscriber | null = null;
let currentUsersListener: Subscriber | null = null;

// Getting base html for the pages

function getDashboardPage(): string
{
	return dashboardHtml;
}

// find the correct on load function to activate buttons and options

function initDashboardPageListeners(): void
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const customEvent = event as CustomEvent<{ path: string; search: string }>;
		const { path, search } = customEvent.detail;

		// reinitializing any possibly existing listener
		cleanupDashboardListeners();

		switch (path)
		{
			case '/dashboard':
			{
				onDashboardLoaded()
				return;
			}

			case '/settings':
			{
				onSettingsLoaded();
				return;
			}

			default:
			{
				onDashboardLoaded()
				return;
			}

		}
	});
}

async function onDashboardLoaded()
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

function cleanupDashboardListeners()
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
