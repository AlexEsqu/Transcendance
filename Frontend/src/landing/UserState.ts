import { User } from "./User";

export { Subscriber, UserState }

type Subscriber = (user: User) => void;

// wrapping the User element in a listening class with singleton
class UserState
{
	private user: User = null;

	// list of all the elements which need to be notified
	// if the user state changes
	private subscriberVector: Subscriber[] = [];

	// singleton, to only ever get one user active
	private static instance: UserState;

	// singleton constructor is private
	private constructor() {}

	// getter
	public static getInstance(): UserState
	{
		if (!UserState.instance)
			UserState.instance = new UserState();

		return UserState.instance;
	}

	// setter which modified User objects and
	// notifies subscribers listening in for state changes
	public setUser(newUser: User): void
	{
		this.user = newUser;
		this.notifySubscribers();
	}

	// subscribing function which returns a unsubscribe function
	public subscribe(callback: Subscriber): () => void
	{
		this.subscriberVector.push(callback);
		return (function ()
		{
			this.subscriberVector = this.subscriberVector.filter
			(
				subscribers => subscribers !== callback
			);
		})
	}

	private notifySubscribers(): void
	{
		this.subscriberVector.forEach(callback => callback(this.user));
	}
}
