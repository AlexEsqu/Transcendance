import { RegisteredUser } from "./User";
import { apiDomainName, apiKey } from "./UserState";
import type { UserState } from "./UserState";

export class SocialService
{
	userState: UserState;

	constructor(userState: UserState)
	{
		this.userState = userState;
	}

	async addToFriendList(friendId: number)
	{
		const user = this.userState.getUser();

		if (!(user instanceof RegisteredUser))
			throw new Error("User is not registered and cannot add friends!");

		if (user.id === null || user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/friends`,
			{
				method: 'POST',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${user.accessToken}`
				},
				body: JSON.stringify({ id: friendId }),
			}
		);

		const data = await response.json();
		console.log(data);
		if (!response.ok)
			throw new Error(data.message || data.error || `Failed to fetch user friends (${response.status})`);

		await this.userState.refreshUser();
		this.userState.notifySubscribers();
	}

	async removeFromFriendList(friendId: number)
	{
		const user = this.userState.getUser();

		if (!(user instanceof RegisteredUser))
		{
			console.log("No registered user to refresh");
			return;
		}

		if (user.id === null || user.id === undefined)
			throw new Error("User id is missing");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/friends`,
			{
				method: 'DELETE',
				headers:
				{
					'accept': 'application/json',
					'Content-Type': 'application/json',
					'X-App-Secret': `${apiKey}`,
					'Authorization': `Bearer ${user.accessToken}`
				},
				body: JSON.stringify({ id: friendId }),
			}
		);

		if (!response.ok)
		{
			const data = await response.json();
			console.log(data);
			throw new Error(data.message || data.error || `Failed to fetch user friends (${response.status})`);
		}

		await this.userState.refreshUser();
		this.userState.notifySubscribers();
	}
}
