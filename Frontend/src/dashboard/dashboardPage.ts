import { userState, router } from "../app"
import { showFriend, showUsers } from "./socialSection";
import { RegisteredUser } from "../user/User";
import type { Subscriber } from "../user/UserState";
import type { User } from "../user/User";
import { displayMatchHistory } from "./graphSection";
import { onAvatarLoaded, onEmailLoaded, onPasswordLoaded, onRenameLoaded } from "./settingSection";

import dashboardHtml from "../html/dashboard.html?raw";

export { getDashboardPage, initDashboardPageListeners }

// variable to hold current listener functions

let currentFriendsListener: Subscriber | null = null;
let currentUsersListener: Subscriber | null = null;
let currentOptionsListener: Subscriber | null = null;

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

async function onDashboardLoaded()
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;

	currentFriendsListener = () => showFriend();
	currentUsersListener = () => showUsers();

	if (isRegistered)
	{
		showRegisteredUserOptions(user);

		currentOptionsListener = (updatedUser: User | null) => {
			if (updatedUser instanceof RegisteredUser) {
				activateTfaButton(updatedUser);
			}
		};

		userState.subscribe(currentOptionsListener);
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

	activateDeleteButton();
	activateTfaButton(user);
}

function activateTfaButton(user : RegisteredUser)
{
	const twoFactorAuthBtn = document.getElementById('enable-tfa-btn');
	if (!twoFactorAuthBtn)
		return;

	const newBtn = twoFactorAuthBtn.cloneNode(true) as HTMLElement;
	twoFactorAuthBtn.parentNode?.replaceChild(newBtn, twoFactorAuthBtn);
	twoFactorAuthBtn.textContent = "";
	if (user.hasTwoFactorAuth)
	{
		twoFactorAuthBtn.textContent = 'Disable Two Factor Authentication';
		twoFactorAuthBtn.addEventListener('click', () => {
			userState.twoFactor.toggle2fa(false);
		});
	}
	else
	{
		twoFactorAuthBtn.textContent = 'Enable Two Factor Authentication';
		twoFactorAuthBtn.addEventListener('click', () => {
			userState.twoFactor.toggle2fa(true);
		});
	}
}

function activateDeleteButton()
{
	const deleteAccBtn = document.getElementById('delete-account-btn');
	if (!deleteAccBtn)
		return;

	deleteAccBtn.addEventListener('click', () => {
		userState.emailAuth.deleteAccount();
		router.navigateTo('/connection')
	});
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
	if (currentOptionsListener)
	{
		userState.unsubscribe(currentOptionsListener);
		currentOptionsListener = null;
	}
}
