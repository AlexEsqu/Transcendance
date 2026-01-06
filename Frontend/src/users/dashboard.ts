import { userState, router } from "../app"
import { showFriend, showUsers } from "./friends";
import { RegisteredUser } from "./User";
import type { Subscriber } from "../auth/UserState";
import { displayMatchHistory } from "./stats";

import dashboardHtml from "../pages/dashboard.html?raw";

import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
import emailFormHtml from "../pages/forms/emailForm.html?raw"

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
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', renameFormHtml);

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
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', avatarFormHtml);

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
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', passwordFormHtml);

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
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', emailFormHtml);

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


// UTILITIES

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
