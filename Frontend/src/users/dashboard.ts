import { userState, router } from "../app"

import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { apiKey, apiDomainName } from '../auth/UserState';

import dashboardHtml from "../pages/dashboard.html?raw";
import formHtml from "../pages/form.html?raw";
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
import friendItemHtml from "../pages/info/friend.html?raw";

import { RegisteredUser } from "./User";
import type { BaseUser } from './User'
// import emailFormHtml from "../pages/forms/emailForm.html?raw"

export { getDashboardPage, getSettingForm, initSettingPageListeners }

// Getting base html

function getDashboardPage(): string
{
	const username = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + dashboardHtml).replace('USERNAME', username);
}

function getSettingForm(): string
{
	const username = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + formHtml).replace('USERNAME', username);
}

// on load function to activate buttons and options

function initSettingPageListeners(): void
{
	initNavBarListeners();

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

			case '/settings/password':
			{
				onPasswordLoaded();
				return;
			}

			// case '/settings/email':
			// {
			// 	onLoginLoaded();
			// 	return;
			// }

			default:
			{
				onDashboardLoaded()
				return;
			}

		}
	});
}

function onRenameLoaded(): void
{
	injectForm(renameFormHtml);
	const renameForm = document.getElementById('rename-form') as HTMLFormElement | null;

	renameForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(renameForm);
			const newName = formData.get('input-new-name') as string | null;

			if (newName)
			{
				userState.rename(newName);
				router.render();
			}

		}
	);
}

function onAvatarLoaded(): void
{
	injectForm(avatarFormHtml);

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
	injectForm(passwordFormHtml);

	const passwordForm = document.getElementById('password-form') as HTMLFormElement | null;
	passwordForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(passwordForm);
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
	);
}



function onDashboardLoaded()
{
	showRegisteredUserOptions();

	activateAddFriendButton();

	showUsers();
}

function activateAddFriendButton(): void
{
	// injectForm(newFriendFormHtml);
	const newFriendForm = document.getElementById('new-friend-form') as HTMLFormElement | null;

	newFriendForm?.addEventListener('submit', async (e) =>
		{
			e.preventDefault();
			const formData = new FormData(newFriendForm);
			const friendUsername = formData.get('new-friend-input') as string | null;

			if (friendUsername)
			{
				const newFriend = await getUserFromUsername(friendUsername);

				console.log(newFriend)

				if (newFriend && newFriend.id)
				{
					try
					{
						userState.addToFriendList(newFriend.id);
					}
					catch (error)
					{
						const msg = error instanceof Error ? error.message : "Unknown error";
						window.sessionStorage.setItem("errorMessage", msg);
						router.navigateTo("/error");
					}
				}

			}

		}
	);
}

async function showUsers(): Promise<void>
{
	const usersSection = document.querySelector('#user-section');
	if (!usersSection)
		return;

	try
	{
		const users = await getAllUsers();
		let html = '<ul class="">';
		for (const user of users)
		{
			console.log(user);
			html += getFriendHtml(user);
		}
		html += '</ul>';
		usersSection.innerHTML += html;

		addFriendListeners();
	}
	catch (err)
	{
		usersSection.innerHTML += `<div class="error">Failed to load users.</div>`;
	}
}

function getFriendHtml(friend : BaseUser)
{
	const username = friend.username ?? "Mystery Guest";
	const avatar = friend.avatar ?? "/assets/placeholder/avatarPlaceholder.png";
	const status = friend.is_active ? 'active' : 'inactive';

	return friendItemHtml
		.replace(/FRIEND_STATUS/g, status)
		.replace(/FRIEND_AVATAR_URL/g, avatar)
		.replace(/FRIEND_NAME/g, username)
		.replace(/FRIEND_ID/g, String(friend.id));
}

function addFriendListeners(): void
{
	document.querySelectorAll('.add-friend-btn').forEach(btn =>
		{
			btn.addEventListener('click', async (event) =>
			{
				const target = event.currentTarget as HTMLElement;
				const friendId = target.dataset.friendId;
				if (!friendId)
					return;

				try
				{
					await userState.addToFriendList(Number(friendId));
					target.textContent = 'Added!';
				}
				catch (error)
				{
					const msg = error instanceof Error ? error.message : "Unknown error";
					console.log(`Failed to add friend: ${msg}`);
				}
			});
	});
}


// UTILITIES

export function injectForm(html: string): void
{
	const container = document.getElementById('form-container');
	if (container) container.insertAdjacentHTML('beforeend', html);
}

function showRegisteredUserOptions()
{
	const user = userState.getUser();
	const isRegistered = user instanceof RegisteredUser;
	document.querySelectorAll('.need-registered-user').forEach(el =>
		{
			(el as HTMLElement).style.display = isRegistered ? 'flex' : 'none';
		}
	);
}

async function getUserFromUsername(username: string): Promise<BaseUser | null>
{
	const allUsers = await getAllUsers();
	return allUsers.find(user => user.username === username) ?? null;
}


async function getAllUsers(): Promise<BaseUser[]>
{
	const response = await fetch(`${apiDomainName}/users`,
		{
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'X-App-Secret': `${apiKey}`
			}
		}
	);

	const data = await response.json();
	if (!response.ok)
		throw new Error(data.message || data.error || 'Friend fetch Failed');

	console.log('Fetched users:')
	console.log(data);
	return data;
}
