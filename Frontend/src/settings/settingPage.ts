import { userState, router } from "../app";
import { User, RegisteredUser } from '../user/User';
import { checkInputValidityOnUnfocus, isValidInputs } from "../utils/inputValidation"
import { showRegisteredUserOptions } from '../dashboard/dashboardPage'
import settingPageHtml from "../html/settings.html?raw"

export { getSettingPage, onSettingsLoaded }

function getSettingPage(): string
{
	return settingPageHtml;
}

function onSettingsLoaded(): void
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;

	if (isRegistered)
	{
		showRegisteredUserOptions(user);
	}

	updateCurrentSettings();

	setupAvatarForm();
	setupUsernameForm();
	setupEmailForm();
	setupPasswordForm();
}


function setupAvatarForm(): void
{
	const btnToggle = document.getElementById('btn-toggle-avatar');
	const btnCancel = document.getElementById('btn-cancel-avatar');
	const form = document.getElementById('avatar-form') as HTMLFormElement | null;

	btnToggle?.addEventListener('click', (e) => {
		form?.classList.toggle('hidden');
		form?.classList.toggle('flex');
		(e.target as HTMLButtonElement).blur();
	});

	btnCancel?.addEventListener('click', (e) => {
		form?.classList.add('hidden');
		form?.reset();
		(e.target as HTMLButtonElement).blur();
	});

	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const formData = new FormData(form);
		if (formData) {
			try {
				await userState.customize.updateAvatar(formData);
				form.classList.add('hidden');
				form.reset();
				updateCurrentSettings();
				alert('Avatar updated!');
			} catch (err) {
				alert('Failed to update avatar.');
				console.error(err);
			}
		}
	});
}

function setupUsernameForm(): void
{
	const btnToggle = document.getElementById('btn-toggle-username');
	const btnCancel = document.getElementById('btn-cancel-username');
	const form = document.getElementById('rename-form') as HTMLFormElement | null;

	if (!form) return;

	checkInputValidityOnUnfocus(form);

	btnToggle?.addEventListener('click', (e) => {
		form?.classList.toggle('hidden');
		form?.classList.toggle('flex');
		(e.target as HTMLButtonElement).blur();
	});

	btnCancel?.addEventListener('click', (e) => {
		form?.classList.add('hidden');
		form?.reset();
		(e.target as HTMLButtonElement).blur();
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		if (isValidInputs(form.querySelectorAll('input'))) {
			const formData = new FormData(form);
			const newName = formData.get('input-new-name') as string | null;
			if (newName) {
				try {
					await userState.customize.rename(newName);
					form.classList.add('hidden');
					form.reset();
					updateCurrentSettings();
				} catch (err) {
					alert(err instanceof Error ? err.message : 'Failed to update username');
				}
			}
		}
	});
}

function setupEmailForm(): void
{
	const btnToggle = document.getElementById('btn-toggle-email');
	const btnCancel = document.getElementById('btn-cancel-email');
	const form = document.getElementById('user-email-form') as HTMLFormElement | null;

	if (!form) return;

	checkInputValidityOnUnfocus(form);

	btnToggle?.addEventListener('click', (e) => {
		form?.classList.toggle('hidden');
		form?.classList.toggle('flex');
		(e.target as HTMLButtonElement).blur();
	});

	btnCancel?.addEventListener('click', (e) => {
		form?.classList.add('hidden');
		form?.reset();
		(e.target as HTMLButtonElement).blur();
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (isValidInputs(form.querySelectorAll('input'))) {
			const formData = new FormData(form);
			const newEmail = formData.get('input-email') as string | null;
			const newEmailCheck = formData.get('input-email-check') as string | null;

			if (newEmail !== newEmailCheck) {
				alert('The emails must match...');
				return;
			}

			if (newEmail) {
				try {
					await userState.customize.changeEmail(newEmail);
					form.classList.add('hidden');
					form.reset();
					updateCurrentSettings();
					alert('Email updated!');
				} catch (err) {
					alert('Failed to update email.');
					console.error(err);
				}
			}
		}
	});
}

function setupPasswordForm(): void
{
	const btnToggle = document.getElementById('btn-toggle-password');
	const btnCancel = document.getElementById('btn-cancel-password');
	const form = document.getElementById('password-form') as HTMLFormElement | null;

	if (!form) return;

	checkInputValidityOnUnfocus(form);

	btnToggle?.addEventListener('click', (e) => {
		form?.classList.toggle('hidden');
		form?.classList.toggle('flex');
		(e.target as HTMLButtonElement).blur();
	});

	btnCancel?.addEventListener('click', (e) => {
		form?.classList.add('hidden');
		form?.reset();
		(e.target as HTMLButtonElement).blur();
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		if (isValidInputs(form.querySelectorAll('input'))) {
			const formData = new FormData(form);
			const newPassword = formData.get('input-password') as string | null;
			const newPasswordCheck = formData.get('input-password-check') as string | null;
			const oldPassword = formData.get('input-old-password') as string | null;

			if (newPassword !== newPasswordCheck) {
				alert("The new passwords don't match...");
				return;
			}

			if (oldPassword && newPassword) {
				try {
					await userState.customize.changePassword(oldPassword, newPassword);
					form.classList.add('hidden');
					form.reset();
					alert('Password updated!');
				} catch (err) {
					alert('Failed to update password.');
					console.error(err);
				}
			}
		}
	});
}

function updateCurrentSettings(): void
{
	// Update username
	const usernameElem = document.getElementById('current-username');
	if (usernameElem && userState.getUser()) {
		usernameElem.textContent = userState.getUser()?.username || 'Not set';
	}

	// Update email
	const emailElem = document.getElementById('current-email');
	if (emailElem && userState.getUser()) {
		emailElem.textContent = userState.getUser()?.username || 'Not set';
	}

	// Update avatar
	const avatarElem = document.getElementById('current-avatar') as HTMLImageElement;
	if (avatarElem && userState.getUser()) {
		avatarElem.src = userState.getUser()?.avatar || '/assets/placeholder/avatarPlaceholder.png';
	}
}

function activateTfaButton(user : RegisteredUser)
{
	const twoFactorAuthBtn = document.getElementById('enable-tfa-btn');
	if (!twoFactorAuthBtn)
		return;

	const newBtn = twoFactorAuthBtn.cloneNode(true) as HTMLElement;
	twoFactorAuthBtn.parentNode?.replaceChild(newBtn, twoFactorAuthBtn);

	if (user.hasTwoFactorAuth)
	{
		newBtn.textContent = 'Disable Two Factor Authentication';
		newBtn.addEventListener('click', () => {
			userState.twoFactor.toggle2fa(false);
		});
	}
	else
	{
		newBtn.textContent = 'Enable Two Factor Authentication';
		newBtn.addEventListener('click', () => {
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
