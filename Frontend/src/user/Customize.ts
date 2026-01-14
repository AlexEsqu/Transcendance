import { RegisteredUser, GuestUser, User, BaseUser } from "./User";
import { router } from "../app";
import { apiDomainName, apiKey } from "./UserState";
import type { UserState } from "./UserState";
import type { MatchHistory } from "../dashboard/graphSection";

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
			router.render();
		}
		else if (user instanceof GuestUser)
		{
			user.username = newName;
		}

		this.userState.setUser(user);
	}

	async updateAvatar(formData: FormData): Promise<void>
	{
		const user = this.userState.getUser();

		if (user instanceof RegisteredUser)
		{
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
		else
		{
			throw new Error(`Avatar update failed: Not a registered User`);
		}
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void>
	{
		const user = this.userState.getUser();

		if (user instanceof RegisteredUser)
		{
			const response = await this.userState.fetchWithTokenRefresh(
				`${apiDomainName}/users/me/password`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${user.accessToken}`,
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
		else
		{
			throw new Error(`Password update failed: Not a registered User`);
		}
	}

	async changeEmail(newEmail: string): Promise<void>
	{
		// AWAITING API ROUTE
	}

	async fetchMatchHistory(): Promise<MatchHistory[]>
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
