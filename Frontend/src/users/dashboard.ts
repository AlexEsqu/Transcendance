import { userState, router } from "../app"

import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { apiKey, apiDomainName } from '../auth/UserState';

import dashboardHtml from "../pages/dashboard.html?raw";

import formHtml from "../pages/form.html?raw";
import renameFormHtml from "../pages/forms/renameForm.html?raw"
import avatarFormHtml from "../pages/forms/avatarForm.html?raw"
import passwordFormHtml from "../pages/forms/passwordForm.html?raw"
// import emailFormHtml from "../pages/forms/emailForm.html?raw"

import { friendTemplate, userTemplate } from "../components/loader";

import { RegisteredUser } from "./User";
import type { BaseUser } from './User'


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

	// activateAddFriendButton();

	showFriendAndUsers();

	userState.subscribe(() => showFriendAndUsers());
}

// function activateAddFriendButton(): void
// {
// 	// injectForm(newFriendFormHtml);
// 	const newFriendForm = document.getElementById('new-friend-form') as HTMLFormElement | null;

// 	newFriendForm?.addEventListener('submit', async (e) =>
// 		{
// 			e.preventDefault();
// 			const formData = new FormData(newFriendForm);
// 			const friendUsername = formData.get('new-friend-input') as string | null;

// 			if (friendUsername)
// 			{
// 				const newFriend = await getUserFromUsername(friendUsername);

// 				console.log(newFriend)

// 				if (newFriend && newFriend.id)
// 				{
// 					try
// 					{
// 						userState.addToFriendList(newFriend.id);
// 					}
// 					catch (error)
// 					{
// 						const msg = error instanceof Error ? error.message : "Unknown error";
// 						window.sessionStorage.setItem("errorMessage", msg);
// 						router.navigateTo("/error");
// 					}
// 				}

// 			}

// 		}
// 	);
// }

async function showFriendAndUsers(): Promise<void>
{
	const userList = document.querySelector('#user-list');
	const friendList = document.querySelector('#friend-list');

	if (!userList || !friendList)
		return;

	// create fragments in memory to load up all users or friends
	const userFragment = document.createDocumentFragment();
	const friendFragment = document.createDocumentFragment();

	try
	{
		const mainUser = userState.getUser();
		const userFriendList = mainUser?.getFriends() ?? [];
		const allUsers = await getAllUsers();

		for (const user of allUsers)
		{
			if (user.id === mainUser?.id)
				continue;

			const isFriend = userFriendList ? userFriendList.some(friend => friend.id === user.id) : false;

			if (isFriend)
				friendFragment.appendChild(createFriendElement(user));
			else
				userFragment.appendChild(createUserElement(user));
		}

		// empty out the list if existing data inside
		userList.innerHTML = '';
		friendList.innerHTML = '';

		// add the fragments in one go
		userList.appendChild(userFragment);
		friendList.appendChild(friendFragment);

		// attach listeners
		attachAddRemoveFriendButtonListener();
	}
	catch (err)
	{
		console.log(err ?? 'unknown error');
		userList.innerHTML += `<div class="error">Failed to load users.</div>`;
	}
}

// clone the templated friend HTML into a friend li html document
// granting type safety
function createFriendElement(friend: BaseUser): HTMLLIElement
{
	const template = friendTemplate as HTMLTemplateElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;

	const li = clone.querySelector('li') as HTMLLIElement;
	const img = clone.querySelector('.friend-avatar-img') as HTMLImageElement;
	const statusDot = clone.querySelector('.friend-status-dot') as HTMLElement;
	const nameSpan = clone.querySelector('.friend-name') as HTMLElement;
	const removeBtn = clone.querySelector('.remove-friend-btn') as HTMLButtonElement;

	img.src = friend.avatar ?? "/assets/placeholder/avatarPlaceholder.png";
	img.alt = `${friend.username} avatar`;
	statusDot.classList.add(`${friend.is_active ? 'active' : 'inactive'}`);
	nameSpan.textContent = friend.username ?? "Mystery Guest";
	removeBtn.dataset.friendId = String(friend.id);

	return li;
}

function createUserElement(user: BaseUser): HTMLLIElement
{
	const template = userTemplate as HTMLTemplateElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;

	const li = clone.querySelector('li') as HTMLLIElement;
	const img = clone.querySelector('.user-avatar-img') as HTMLImageElement;
	const statusDot = clone.querySelector('.user-status-dot') as HTMLElement;
	const nameSpan = clone.querySelector('.user-name') as HTMLElement;
	const addBtn = clone.querySelector('.add-friend-btn') as HTMLButtonElement;

	img.src = user.avatar ?? "/assets/placeholder/avatarPlaceholder.png";
	img.alt = `${user.username} avatar`;
	statusDot.classList.add(`${user.is_active ? 'active' : 'inactive'}`);
	nameSpan.textContent = user.username ?? "Mystery Guest";
	addBtn.dataset.userId = String(user.id);

	return li;
}

// attach listener to each friend, in a separate function to optimise
// speed on large amount of elements, may be overkill here but in the
// spirit of making a website able to accomodate 50+ players
function attachAddRemoveFriendButtonListener(): void
{
	document.querySelectorAll('.add-friend-btn').forEach(btn =>
	{
		btn.addEventListener('click', async (event) =>
		{
			const target = event.currentTarget as HTMLButtonElement;
			const userId = target.dataset.userId;
			if (!userId)
				return;

			try
			{
				await userState.addToFriendList(Number(userId));
				target.textContent = 'Added!';
				target.disabled = true;
			}
			catch (error)
			{
				const msg = error instanceof Error ? error.message : "Unknown error";
				console.log(`Failed to add friend: ${msg}`);
			}
		});
	});

	document.querySelectorAll('.remove-friend-btn').forEach(btn =>
	{
		btn.addEventListener('click', async (event) =>
		{
			const target = event.currentTarget as HTMLButtonElement;
			const friendId = target.dataset.friendId;
			if (!friendId)
				return;

			try
			{
				await userState.removeFromFriendList(Number(friendId));
				target.textContent = 'Removed!';
				target.disabled = true;
			}
			catch (error)
			{
				const msg = error instanceof Error ? error.message : "Unknown error";
				console.log(`Failed to remove friend: ${msg}`);
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
