import { userState, router } from "../app"
import { showFriend, showUsers } from "./socialSection";
import { RegisteredUser } from "../user/User";
import type { Subscriber } from "../user/UserState";
import { displayMatchHistory } from "./graphsSection";
import { onAvatarLoaded, onEmailLoaded, onPasswordLoaded, onRenameLoaded } from "./settingsSection";

import dashboardHtml from "../pages/dashboard.html?raw";

export { getDashboardPage, initDashboardPageListeners }

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
		const { detail: path } = event as CustomEvent<string>;

		// reinitializing any possibly existing listener
		cleanupDashboardListeners();

		switch (path)
		{
			case '/dashboard/rename':
			{
				onRenameLoaded();
				return;
			}

			case '/dashboard/avatar':
			{
				onAvatarLoaded();
				return;
			}

			case '/dashboard/password':
			{
				onPasswordLoaded();
				return;
			}

			case '/dashboard/email':
			{
				onEmailLoaded(); // TO DO : add api route
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

// LOAD DASHBOARD DATA

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

	const twoFactorAuthBtn = document.getElementById('enable-tfa-btn');
	if (twoFactorAuthBtn)
	{
		if (user.hasTwoFactorAuth) {
			twoFactorAuthBtn.textContent = 'Disable Two Factor Authentication';
			twoFactorAuthBtn.addEventListener('click', () => {
				userState.disableTwoFactorAuth();
			});
		} else {
			twoFactorAuthBtn.textContent = 'Enable Two Factor Authentication';
			twoFactorAuthBtn.addEventListener('click', () => {
				userState.enableTwoFactorAuth();
			});
		}
	}

	const deleteAccBtn = document.getElementById('delete-account-btn');
	deleteAccBtn?.addEventListener('click', () => {
		userState.deleteAccount();
		router.navigateTo('')
	})
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
