import { userState, router } from "../app"

import { getNavBarHtml, initNavBarListeners } from "../routing/nav";

import dashboardHtml from "../pages/dashboard.html?raw";
import formHtml from "../pages/form.html?raw";
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
import { RegisterClass } from "@babylonjs/core";
import { GuestUser, RegisteredUser } from "./User";
// import emailFormHtml from "../pages/forms/emailForm.html?raw"

export { getDashboardPage, getSettingForm, initSettingPageListeners }

// Getting base html

function getDashboardPage(): string
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + dashboardHtml).replace('USERNAME', name);
}

function getSettingForm(): string
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + formHtml).replace('USERNAME', name);
}

// on load function to activate buttons and options

function initSettingPageListeners(): void
{
	initNavBarListeners();

	console.log(import.meta.env);

	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

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

			// case '/settings/email':
			// {
			// 	onLoginLoaded();
			// 	return;
			// }

			default:
			{
				showRegisteredUserOptions();
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


// UTILITIES

export function injectForm(html: string): void
{
	const container = document.getElementById('form-container');
	if (container) container.insertAdjacentHTML('beforeend', html);
}

function showRegisteredUserOptions()
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;
	document.querySelectorAll('.need-registered-user').forEach(el =>
		{
			(el as HTMLElement).style.display = isRegistered ? 'flex' : 'none';
		}
	);
}
