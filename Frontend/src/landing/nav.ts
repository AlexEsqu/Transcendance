import navHTML from "../pages/nav.html"
import { displayAliasQueryPage } from "./alias"
import { renderPageState } from "./history"
import { User, GuestUser, RegisteredUser } from "./User"
import { userState } from "../app"

export { displayNavBar, goToPage, updateNavFromUserData }

async function displayNavBar()
{
	document.body.insertAdjacentHTML("beforeend", navHTML);

	// add button events
	setLogoutButton();
	setSettingButton();

	// subscribe to changes in the user object so they update the nav bar
	// userState.subscribe(updateNavFromUserData);

	const currentUser = userState.getUser();
	if (currentUser) {
		updateNavFromUserData(currentUser);
	}
}

function updateNavFromUserData(user: User | null): void
{
	console.log('updateNavFromUseData called with user:', user?.getName() || 'null');

	if (!user)
	{
		goToPage('landing');
		return;
	}

	if (user instanceof RegisteredUser)
		setDeleteUserButton();

	const userNameElement = document.getElementById('user-name-nav');
	userNameElement.textContent = user.getName();

	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;
	avatarImage.src = user.getAvatarPath();
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
				goToPage('landing');
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
			goToPage('landing');
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
		const pageState = { page: 'dashboard' };
		window.history.pushState(pageState, '', `#${pageState.page}`);
		renderPageState(pageState);
	});
}

function goToPage(pageName: string)
{
	const currentHash = window.location.hash.replace('#', '');
	if (currentHash === pageName) {
		console.log('Already on page:', pageName);
		return;
	}

	const pageState = { page: pageName };
	window.history.pushState(pageState, '', `#${pageState.page}`);
	renderPageState(pageState);
}
