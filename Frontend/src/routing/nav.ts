import navHTML from "../pages/nav.html?raw"
import { User, RegisteredUser } from "../users/User"
import { userState, router } from "../app"

export { getNavBarHtml, initNavBarListeners }

function getNavBarHtml()
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return navHTML.replace('USERNAME', name);
}

function initNavBarListeners()
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const customEvent = event as CustomEvent<string>;
		const path = customEvent.detail;

		if (path.startsWith('/settings') || path.startsWith('/game'))
		{
			attachNavListeners();
			updateNavFromUserData(userState.getUser());
		}
	});
}

function attachNavListeners()
{
	const logoutButton = document.getElementById('logout-btn');
	if (logoutButton)
	{
		logoutButton.addEventListener('click', async () => {
			try {
				await userState.logout();
			} catch (error) {
				console.error('Logout failed:', error);
			}
		});
	}

	const settingButton = document.getElementById('user-info-btn');
	if (settingButton)
	{
		settingButton.addEventListener('click', () => {
			router.navigateTo('setting');
		});
	}
}

function updateNavFromUserData(user: User | null): void
{
	if (!user)
		return;

	const userNameElement = document.getElementById('user-name-nav');
	if (userNameElement)
		userNameElement.textContent = user.getName();

	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;
	if (avatarImage)
		avatarImage.src = user.getAvatarPath();

	// // only display the delete account button if the user is registered (has an account to delete)
	// const deleteButton = document.getElementById('delete-user-btn');
	// if (deleteButton)
	// 	deleteButton.style.display = user instanceof RegisteredUser ? 'block' : 'none';
}
