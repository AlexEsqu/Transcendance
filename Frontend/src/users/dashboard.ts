import { userState  } from "../app"

import dashboardHtml from "../pages/dashboard.html?raw";
import formHtml from "../pages/form.html?raw";
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
// import emailFormHtml from "../pages/forms/emailForm.html?raw"

export { getDashboardPage, getSettingForm, initSettingPageListeners }

// Getting base html

function getDashboardPage()
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return dashboardHtml.replace('USERNAME', name);
}

function getSettingForm(): string {

	return formHtml;
}

// on load function to activate buttons and options

function initSettingPageListeners(): void
{
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

			// case '/settings/password':
			// {
			// 	onLoginLoaded();
			// 	return;
			// }

			// case '/settings/username':
			// {
			// 	onLoginLoaded();
			// 	return;
			// }

			// case '/settings/email':
			// {
			// 	onLoginLoaded();
			// 	return;
			// }

			default:
			{
				return;
			}

		}
	});
}

function onRenameLoaded(): void
{
	injectForm(renameFormHtml);

	const renameForm = document.getElementById('rename-form') as HTMLFormElement | null;
	renameForm?.addEventListener('submit', (e) =>
		{
			e.preventDefault();
			const formData = new FormData(renameForm);
			const newName = formData.get('input-rename-user') as string | null;
			// DO RENAME
		}
	);
}

function onAvatarLoaded(): void
{
	injectForm(avatarFormHtml);

	const avatarForm = document.getElementById('avatar-form') as HTMLFormElement | null;
	avatarForm?.addEventListener('submit', (e) =>
		{
			e.preventDefault();
			const formData = new FormData(avatarForm);
			const newAvatarUrl = formData.get('input-avatar-file') as string | null;
			// DO AVATAR CHANGE
		}
	);
}


// UTILITIES

function injectForm(html: string): void
{
	const container = document.getElementById('form-container');
	if (container) container.insertAdjacentHTML('beforeend', html);
}
