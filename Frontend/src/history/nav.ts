import navHTML from "../pages/nav.html"
import { displayConnectionPage } from "../connection/connection"
import { renderPageState } from "../history/history"
import { User, GuestUser, RegisteredUser } from "../user/User"
import { userState } from "../app"

export { displayNavBar, goToPage, updateNavFromUserData }

async function displayNavBar()
{
	const navExists = document.querySelector('nav');
	if (navExists)
		return;

	document.body.insertAdjacentHTML("beforeend", navHTML);

	setLogoutButton();
	setSettingButton();
}

function updateNavFromUserData(user: User | null): void {
	if (!user) return;

	// Update username
	const userNameElement = document.getElementById('user-name-nav');
	if (userNameElement) {
		userNameElement.textContent = user.getName();
	}

	// Update avatar
	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;
	if (avatarImage) {
		avatarImage.src = user.getAvatarPath();
	}

	// Show/hide delete button based on user type
	const deleteButton = document.getElementById('delete-user-btn');
	if (deleteButton) {
		if (user instanceof RegisteredUser) {
			deleteButton.style.display = 'block';
		} else {
			deleteButton.style.display = 'none';
		}
	}
}

function setLogoutButton()
{
	const logoutButton = document.getElementById('logout-btn');

	logoutButton.addEventListener('click', async () =>
	{
		try
		{
			await userState.logout();
			goToPage('connection');
		}
		catch (error)
		{
			console.error('Logout failed:', error);
		}
	});
}

function setSettingButton()
{
	const settingUserButton = document.getElementById('user-info-btn');

	settingUserButton.addEventListener('click', () =>
	{
		const pageState = '/setting/dashboard';
		window.history.pushState(pageState, '', pageState);
		renderPageState(pageState);
	});
}

function goToPage(pageName: string)
{
	window.history.pushState(pageName, '', pageName);
	renderPageState(pageName);
}
