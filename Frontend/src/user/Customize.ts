import { RegisteredUser, GuestUser, User, BaseUser } from "./User";
import { router } from "../app";
import { apiDomainName, apiKey } from "./UserState";
import type { UserState } from "./UserState";
import type { BackendMatch } from "../dashboard/graphSection";

export class CustomizeService
{
	userState: UserState;

	constructor(userState: UserState)
	{
		this.userState = userState;
	}

	async rename(newName: string): Promise<void>
	{
		const user = this.userState.getUser();
		if (!user)
			return;

		if (user instanceof RegisteredUser)
		{
			const response = await this.userState.fetchWithTokenRefresh(
				`${apiDomainName}/users/me/username`,
				{
					method: 'PUT',
					headers:
					{
						'accept': 'application/json',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${user.accessToken}`,
						'X-App-Secret': `${apiKey}`
					},
					body: JSON.stringify({
						new_username: newName
					})
				}
			);

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || 'Renaming failed');

			user.username = newName;
		}

		if (user instanceof GuestUser)
		{
			user.username = newName;
		}

		this.userState.setUser(user);
		router.render();
	}

	async updateAvatar(formData: FormData): Promise<void>
	{
		const user = this.userState.getUser();
		if (!(user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/avatar`,
			{
				method: 'PUT',
				headers:
				{
					'accept': 'application/json',
					'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: formData,
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(`Avatar update failed: ${response.status}, ${data.message}`);

		await this.userState.refreshUser();
		this.userState.notifySubscribers();
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void>
	{
		const user = this.userState.getUser();
		if (!(user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/password`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({
					oldPassword, newPassword
				})
			}
		);

		const data = await response.json();
		if (!response.ok)
			throw new Error(data.message || 'Password change failed');
	}

	async changeEmail(newEmail: string): Promise<void>
	{
		const user = this.userState.getUser();
		if (!(user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/me/change-email`,
			{
				method: 'PUT',
				headers:
				{
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				},
				body: JSON.stringify({
					email: newEmail
				})
			}
		);

		const data = await response.json();

		if (!response.ok)
			throw new Error(data.message || data.error || 'Failed to fetch match history');

		return data;
	}

	async fetchMatchHistory(): Promise<BackendMatch[]>
	{
		const user = this.userState.getUser();
		if (!(user instanceof RegisteredUser))
			throw new Error("Not authenticated");

		const response = await this.userState.fetchWithTokenRefresh(
			`${apiDomainName}/users/${user.id}/matches`,
			{
				method: 'GET',
				headers:
				{
					'accept': 'application/json',
					'Authorization': `Bearer ${user.accessToken}`,
					'X-App-Secret': `${apiKey}`
				}
			}
		);

		const data = await response.json();

		if (!response.ok)
			throw new Error(data.message || data.error || 'Failed to fetch match history');

		return data;
	}
}
