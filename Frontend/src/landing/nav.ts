import navHTML from "../pages/nav.html"
import { displayAliasQueryPage } from "./alias"
import { renderPageState } from "./history"
import { User, GuestUser, RegisteredUser } from "./User"
import { userState } from "../app"

export { displayNavBar}

async function displayNavBar()
{
	document.body.insertAdjacentHTML("beforeend", navHTML);

	// subscribe to changes in the user object so they update the nav bar
	userState.subscribe(updateNavFromUseData);

	// add button events

	setLogoutButton();
	setSettingButton();
	if (userState.getUser() instanceof RegisteredUser)
		setDeleteUserButton();
}

function updateNavFromUseData(user: User): void
{
	if (!user)
	{
		// return;
		goToAliasPage();
	}

	const userNameElement = document.getElementById('user-name-nav');
	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;

	if (userNameElement) {
		userNameElement.textContent = user.getName();
	}
	if (avatarImage) {
		avatarImage.src = user.getAvatarPath();
	}
}

function setDeleteUserButton()
{
	const deleteUserButton = document.getElementById('delete-user-btn');
	deleteUserButton.style.display = "block";

	deleteUserButton.addEventListener('click', async () =>
	{
		if (confirm('Are you sure you want to delete your account?'))
		{
			try
			{
				await userState.deleteAccount();
				goToAliasPage();
			}
			catch (error)
			{
				console.error('Failed to delete account:', error);
				alert('Failed to delete account');
			}
		}
	});
}

function setLogoutButton()
{
	const logoutButton = document.getElementById('logout-btn');

	logoutButton.addEventListener('click', async () =>
	{
		try
		{
			await userState.logout();
			goToAliasPage();
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
		const pageState = { page: 'user' };
		window.history.pushState(pageState, '', `#${pageState.page}`);
		renderPageState(pageState);
	});
}

function goToAliasPage()
{
	const pageState = { page: 'welcome' };
	window.history.pushState(pageState, '', `#${pageState.page}`);
	renderPageState(pageState);
}
