import { GuestUser } from "../user/User";
import { UserState } from "../user/UserState";

export class GuestService
{
	constructor(private userState: UserState)
	{
		userState = userState;
	}

	guestin(username: string): void
	{
		const guestUser = new GuestUser(username);
		this.userState.setUser(guestUser);
	}

	guestout(): void
	{
		this.userState.resetUser();
	}
}

