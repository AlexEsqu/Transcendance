import { userState, router } from "../app"

import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { showFriend, showUsers } from "./friends";

import dashboardHtml from "../pages/dashboard.html?raw";

import formHtml from "../pages/form.html?raw";
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
import emailFormHtml from "../pages/forms/emailForm.html?raw"

import { RegisteredUser } from "./User";
import type { Subscriber } from "../auth/UserState";

export { getDashboardPage, getSettingForm, initDashboardPageListeners }


// variable to hold current listener functions

let currentFriendsListener: Subscriber | null = null;
let currentUsersListener: Subscriber | null = null;


// Getting base html for the pages

function getDashboardPage(): string
{
	return dashboardHtml;
}

function getSettingForm(): string
{
	return formHtml;
}


// find the correct on load function to activate buttons and options

function initDashboardPageListeners(): void
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

		initNavBarListeners();

		// reinitializing any possibly existing listener
		cleanupDashboardListeners();

		switch (path)
		{
			case '/settings/rename':
			{
				onRenameLoaded();
				return;
			}

			case '/settings/avatar':
			{
				onAvatarLoaded();
				return;
			}

			case '/settings/password':
			{
				onPasswordLoaded();
				return;
			}

			case '/settings/email':
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

function onRenameLoaded(): void
{
	injectForm(renameFormHtml);
	const renameForm = document.getElementById('rename-form') as HTMLFormElement | null;

	renameForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(renameForm);
			const newName = formData.get('input-new-name') as string | null;

			if (newName)
			{
				userState.rename(newName);
				router.render();
			}

		}
	);
}

function onAvatarLoaded(): void
{
	injectForm(avatarFormHtml);

	const avatarForm = document.getElementById('avatar-form') as HTMLFormElement | null;
	avatarForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(avatarForm);
			if (formData) {
				try
				{
					await userState.updateAvatar(formData);
					alert('Avatar updated!');
				}
				catch (err)
				{
					alert('Failed to update avatar.');
					console.error(err);
				}
			}
		}
	);
}

function onPasswordLoaded(): void
{
	injectForm(passwordFormHtml);

	const passwordForm = document.getElementById('password-form') as HTMLFormElement | null;
	passwordForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(passwordForm);
			const newPassword = formData.get('input-password') as string | null;
			const newPasswordCheck = formData.get('input-password-check') as string | null;
			const oldPassword = formData.get('input-old-password') as string | null;
			if (newPassword === newPasswordCheck)
			{
				alert("The new passwords doesn't match...")
				return;
			}
			if (oldPassword && newPassword) {
				try
				{
					await userState.changePassword(oldPassword, newPassword);
					alert('password updated!');
				}
				catch (err)
				{
					alert('Failed to update password.');
					console.error(err);
				}
			}
		}
	);
}

function onEmailLoaded(): void
{
	injectForm(emailFormHtml);
	const emailForm = document.getElementById('user-email-form') as HTMLFormElement | null;

	emailForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(emailForm);
			const newEmail = formData.get('input-email') as string | null;
			const newEmailCheck = formData.get('input-email-check') as string | null;

			if (newEmail != newEmailCheck)
			{
				alert('the email must match...');
			}

			if (newEmail)
			{
				userState.changeEmail(newEmail);
				alert('email unsupported so far!');
				router.render();
			}

		}
	);
}

function onDashboardLoaded()
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;

	currentFriendsListener = () => showFriend();
	currentUsersListener = () => showUsers();

	if (isRegistered)
	{
		showRegisteredUserOptions();
		userState.subscribe(currentFriendsListener);
	}

	userState.subscribe(currentUsersListener);
}


// UTILITIES

export function injectForm(html: string): void
{
	const container = document.getElementById('form-container');
	if (container)
		container.insertAdjacentHTML('beforeend', html);
}

function showRegisteredUserOptions()
{
	document.querySelectorAll('.need-registered-user').forEach(el =>
		{
			(el as HTMLElement).style.display = 'flex';
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
