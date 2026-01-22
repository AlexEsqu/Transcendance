import { userState, router } from "../app";
import { User, RegisteredUser } from '../user/User';
import { checkInputValidityOnUnfocus, isValidInputs } from "../utils/inputValidation"
import { showRegisteredUserOptions } from '../dashboard/dashboardPage'
import settingPageHtml from "../html/settings.html?raw"
import { Subscriber } from "../user/UserState";

export { getSettingPage, onSettingsLoaded, cleanupSettingPage }

let currentOptionsListener: Subscriber | null = null;

function getSettingPage(): string
{
	return settingPageHtml;
}

function onSettingsLoaded(): void
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;

	cleanupSettingPage();

	if (isRegistered)
	{
		showRegisteredUserOptions(user);
		setupAvatarForm();
		setupEmailForm();
		setupPasswordForm();
		activateTfaButton(user);
		activateDeleteButton();

		currentOptionsListener = (updatedUser: User | null) => {
			if (updatedUser instanceof RegisteredUser) {
				activateTfaButton(updatedUser);
			}
		};

		userState.subscribe(currentOptionsListener);
	}

	setupUsernameForm();
	updateCurrentSettings();
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

			if (newEmail !== newEmailCheck)
			{
				alert('The emails must match...');
				return;
			}
			if (newEmail)
			{
				try
				{
					await userState.customize.changeEmail(newEmail);
					form.classList.add('hidden');
					form.reset();
					updateCurrentSettings();
					alert('Email updated!');
					userState.resetUser();
				}
				catch (err)
				{
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
					userState.resetUser();
					router.navigateTo('/connection');
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
		emailElem.textContent = userState.getUser()?.email || 'Not set';
	}

	// Update avatar
	const avatarElem = document.getElementById('current-avatar') as HTMLImageElement;
	if (avatarElem && userState.getUser()) {
		avatarElem.src = userState.getUser()?.avatar || '/assets/placeholder/avatarPlaceholder.png';
	}
}

function activateTfaButton(user : RegisteredUser)
{
	const twoFactorAuthSection = document.getElementById('toggle-tfa-container');
	if (!twoFactorAuthSection)
		return;

	const new2FASection = twoFactorAuthSection.cloneNode(true) as HTMLElement;
	const new2FATitle = new2FASection.querySelector('#tfa-title');
	const new2FAInfo = new2FASection.querySelector('#tfa-info');
	const new2FAButton = new2FASection.querySelector('#tfa-toggle-btn');
	if (!new2FASection || !new2FATitle || !new2FAInfo || !new2FAButton)
		return;

	twoFactorAuthSection.parentNode?.replaceChild(new2FASection, twoFactorAuthSection);

	console.log('user in tfa toggle is')
	console.log(user);

	if (user.hasTwoFactorAuth)
	{
		new2FATitle.textContent = "Remove email verification on login";
		new2FAInfo.textContent = "Two Factor Authentication is currently enabled"
		new2FAButton.textContent = 'Disable Two Factor Authentication';
		new2FAButton.addEventListener('click', async () => {
			await userState.twoFactor.toggle2fa(false);
		});
		new2FAButton.classList.remove('glow-button');
		new2FAButton.classList.add('red-glow-button');
		new2FATitle.classList.add('text-red-400');
		new2FAInfo.classList.remove('text-slate-400');
		new2FAInfo.classList.add('text-red-300');
	}
	else
	{
		new2FATitle.textContent = "Add email verification on login";
		new2FAInfo.textContent = "Two Factor Authentication is currently disabled"
		new2FAButton.textContent = 'Enable Two Factor Authentication';
		new2FAButton.addEventListener('click', async () => {
			await userState.twoFactor.toggle2fa(true);
		});
		new2FAButton.classList.add('glow-button');
		new2FAButton.classList.remove('red-glow-button');
		new2FATitle.classList.remove('text-red-400');
		new2FAInfo.classList.add('text-slate-400');
		new2FAInfo.classList.remove('text-red-300');
	}
}

function activateDeleteButton()
{
	const deleteAccBtn = document.getElementById('delete-account-btn');
	if (!deleteAccBtn)
		return;

	const newBtn = deleteAccBtn.cloneNode(true) as HTMLElement;
	deleteAccBtn.parentNode?.replaceChild(newBtn, deleteAccBtn);

	newBtn.addEventListener('click', () => {
		if (confirm('Are you sure you want to delete your account? This cannot be undone.'))
			{
				userState.emailAuth.deleteAccount();
				router.navigateTo('/connection');
			}
		}
	);
}

function cleanupSettingPage()
{
	if (currentOptionsListener)
	{
		userState.unsubscribe(currentOptionsListener);
		currentOptionsListener = null;
	}
}
