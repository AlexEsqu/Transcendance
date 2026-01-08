import { userState, router } from "../app"
import { checkInputValidityOnUnfocus, isValidInputs } from "../utils/inputValidation"
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
import emailFormHtml from "../pages/forms/emailForm.html?raw"

export { onAvatarLoaded, onRenameLoaded, onEmailLoaded, onPasswordLoaded }

function onRenameLoaded(): void
{
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', renameFormHtml);

	const renameForm = document.getElementById('rename-form') as HTMLFormElement | null;
	if (!renameForm)
		return;

	checkInputValidityOnUnfocus(renameForm);
	renameForm.addEventListener('submit', async (e) =>
		{
			e.preventDefault();

			if (isValidInputs(renameForm.querySelectorAll('input')))
			{
				const formData = new FormData(renameForm);
				const newName = formData.get('input-new-name') as string | null;
				if (newName)
				{
					try
					{
						await userState.rename(newName);
						router.render();
					}
					catch (err)
					{
						alert(err instanceof Error ? err.message : 'Failed to update username');
					}
				}
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
	if (!passwordForm)
		return

	checkInputValidityOnUnfocus(passwordForm);
	passwordForm.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(passwordForm);

			if (isValidInputs(passwordForm.querySelectorAll('input')))
			{
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
		}
	);
}

function onEmailLoaded(): void
{
	const mainContainer = document.getElementById('main')
	if (mainContainer)
		mainContainer.insertAdjacentHTML('beforeend', emailFormHtml);

	const emailForm = document.getElementById('user-email-form') as HTMLFormElement | null;
	if (!emailForm)
		return;

	checkInputValidityOnUnfocus(emailForm);

	emailForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			if (isValidInputs(emailForm.querySelectorAll('input')))
			{
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
		}
	);
}
