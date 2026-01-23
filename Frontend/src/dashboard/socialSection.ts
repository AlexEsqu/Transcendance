import { userState } from "../app";
import { RegisteredUser, type BaseUser } from '../user/User'
import { apiKey, apiDomainName } from '../user/UserState';
import { friendTemplate, userTemplate } from "../utils/templateLoader";

export { showFriend, showUsers }

async function showFriend(): Promise<void>
{
	const friendSection = document.querySelector('#friend-section')
	const friendList = document.querySelector('#friend-list');

	if (!friendList || !friendSection)
		return;

	// create fragments in memory to load up all friends
	const friendFragment = document.createDocumentFragment();

	try
	{
		const mainUser = userState.getUser();
		const userFriendList = mainUser?.getFriends() ?? [];

		if (userFriendList.length > 0)
		{
			for (const friend of userFriendList)
			{
				friendFragment.appendChild(createFriendElement(friend));
			}
		}
		else
		{
			friendFragment.appendChild(document.createTextNode('No friends yet...'))
		}

		// empty out the list if existing data inside
		friendList.innerHTML = '';

		// add the fragments in one go
		friendList.appendChild(friendFragment);

		// attach listeners
		attachAddRemoveFriendButtonListener();
	}
	catch (err)
	{
		console.log(err ?? 'unknown error');
		friendList.innerHTML += `<div class="error">Failed to load friends.</div>`;
	}
}

async function showUsers(): Promise<void>
{
	const userList = document.querySelector('#user-list');

	if (!userList)
		return;

	// create fragments in memory to load up all users
	const userFragment = document.createDocumentFragment();

	try
	{
		const mainUser = userState.getUser();
		const isRegistered = mainUser instanceof RegisteredUser;
		const userFriendList = mainUser?.getFriends() ?? [];
		const allUsers = await getAllUsers();

		if (allUsers.length > 1)
		{
			for (const user of allUsers)
			{
				if (user.id === mainUser?.id)
					continue;

				const isFriend = userFriendList ? userFriendList.some(friend => friend.id === user.id) : false;
				userFragment.appendChild(createUserElement(user, isRegistered, isFriend));
			}
		}
		else
		{
			userFragment.appendChild(document.createTextNode(`No ${isRegistered? "other" : ""} users yet...`));
		}

		// empty out the list if existing data inside
		userList.innerHTML = '';

		// add the fragments in one go
		userList.appendChild(userFragment);

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

function createUserElement(user: BaseUser, isRegistered: boolean, isFriend: boolean): HTMLLIElement
{
	const template = userTemplate as HTMLTemplateElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;

	const li = clone.querySelector('li') as HTMLLIElement;
	const img = clone.querySelector('.user-avatar-img') as HTMLImageElement;
	const statusDot = clone.querySelector('.user-status-dot') as HTMLElement;
	const nameSpan = clone.querySelector('.user-name') as HTMLElement;

	img.src = user.avatar ?? "/assets/placeholder/avatarPlaceholder.png";
	img.alt = `${user.username} avatar`;
	statusDot.classList.add(`${user.is_active ? 'active' : 'inactive'}`);
	nameSpan.textContent = user.username ?? "Mystery Guest";

	// adding 'add as friend' if the user is registered only
	if (isRegistered)
	{
		if (!isFriend)
		{
			const addBtn = clone.querySelector('.add-friend-btn') as HTMLButtonElement;
			addBtn.dataset.userId = String(user.id);
		}
		else
		{
			const addBtn = clone.querySelector('.add-friend-btn') as HTMLButtonElement;
			addBtn.textContent = 'Friend ❤️'
			addBtn.disabled = true;
		}
	}
	else
	{
		const addBtn = clone.querySelector('.add-friend-btn') as HTMLButtonElement;
		addBtn?.remove();
	}

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
				await userState.social.addToFriendList(Number(userId));
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
				await userState.social.removeFromFriendList(Number(friendId));
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

			}
		}
	);

	const data = await response.json();
	if (!response.ok)
		throw new Error(data.message || data.error || 'Friend fetch Failed');
	return data;
}

export async function getUser(id: number): Promise<BaseUser>
{
	const response = await fetch(`${apiDomainName}/users/${id}`,
		{
			method: 'GET',
			headers: {
				'accept': 'application/json',

			}
		}
	);

	const data = await response.json();
	if (!response.ok)
		throw new Error(data.message || data.error || 'Friend fetch Failed');
	return data;
}
