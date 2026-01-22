import navHTML from "../html/nav.html?raw"
import { User, RegisteredUser } from "../user/User"
import { userState, router } from "../app"
import { UserState } from "../user/UserState";

export { getNavBarHtml, initNavBarListeners }

function getNavBarHtml()
{
	const name = userState.getUser()?.getName() ?? "Guest";
	const avatar = userState.getUser()?.getAvatarPath() ?? "/assets/placeholder/avatarPlaceholder.png";

	return navHTML
		.replace('USERNAME', name)
		.replace('/assets/placeholder/avatarPlaceholder.png', avatar);
}

let hasAttachedNavListeners = false;

function initNavBarListeners()
{
	document.addEventListener('navbarLoaded', () =>
		{
			attachNavListeners();
		}
	);
	hasAttachedNavListeners = true;

	UserState.getInstance().subscribe(() => updateNavFromUserData());
}

function attachNavListeners()
{
	const user = userState.getUser();
	const logoutButton = document.getElementById('logout-btn');
	if (!logoutButton || !user)
		return;

	if (user instanceof RegisteredUser)
	{
		logoutButton.addEventListener('click', async () => {
			try
			{
				await userState.emailAuth.logout();
			}
			catch (error)
			{
				const msg = error instanceof Error ? error.message : "Unknown error";
				console.log(`error message is ${msg}`);
				window.sessionStorage.setItem("errorMessage", msg);
				router.navigateTo("/error");
			}
		});
	}
	else
	{
		logoutButton.innerText = 'Quit';
		logoutButton.addEventListener('click', async () => {
			if (confirm('Are you sure you want to quit?'))
			{
				try
				{
					await userState.emailAuth.logout();
				}
				catch (error)
				{
					const msg = error instanceof Error ? error.message : "Unknown error";
					console.log(`error message is ${msg}`);
					window.sessionStorage.setItem("errorMessage", msg);
					router.navigateTo("/error");
				}
			}
		});
	}
}

function updateNavFromUserData(): void
{
	const user = userState.getUser();
	const navElem = document.getElementById('nav');
	if (!user)
	{
		if (navElem)
			navElem.style.display ='hidden';
		return;
	}

	const userNameElement = document.getElementById('user-name-nav');
	if (userNameElement)
		userNameElement.textContent = user.getName();

	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;
	if (avatarImage)
		avatarImage.src = user.getAvatarPath();
}
