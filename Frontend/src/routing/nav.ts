import navHTML from "../pages/nav.html?raw"
import { User, RegisteredUser } from "../users/User"
import { userState, router } from "../app"
import { UserState } from "../auth/UserState";

export { getNavBarHtml, initNavBarListeners }

function getNavBarHtml()
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return navHTML.replace('USERNAME', name);
}

let hasAttachedNavListeners = false;

function initNavBarListeners()
{
	if (hasAttachedNavListeners)
		return;

	document.addEventListener('navbarLoaded', () => {
		attachNavListeners();
		hasAttachedNavListeners = true;
	});

	UserState.getInstance().subscribe(() => updateNavFromUserData());
}

function attachNavListeners()
{
	const logoutButton = document.getElementById('logout-btn');
	if (logoutButton)
	{
		logoutButton.addEventListener('click', async () => {
			try
			{
				await userState.logout();
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
}

function updateNavFromUserData(): void
{
	const user = userState.getUser();
	if (!user)
		return;

	const userNameElement = document.getElementById('user-name-nav');
	if (userNameElement)
		userNameElement.textContent = user.getName();

	const avatarImage = document.getElementById('user-avatar-nav') as HTMLImageElement;
	if (avatarImage)
		avatarImage.src = user.getAvatarPath();
}
