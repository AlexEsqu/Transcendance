export { User, RegisteredUser, GuestUser, placeholderAvatar }
export type { BaseUser }

const placeholderAvatar : string = "/assets/placeholder/avatarPlaceholder.png"

interface BaseUser {
	id: number;
	username: string;
	avatar: string | null;
	is_active: boolean;
}

abstract class User implements BaseUser {
	id: number;
	username: string;
	avatar: string;
	email: string;
	friends: BaseUser[];
	is_active: boolean;

	constructor(username: string)
	{
		this.id = -1;
		this.username = username;
		this.email = "";
		this.avatar = placeholderAvatar;
		this.friends = [];
		this.is_active = true;
	}

	getName(): string
	{
		return this.username;
	}

	getId(): number
	{
		return this.id;
	}

	getAvatarPath(): string
	{
		return this.avatar;
	}

	getFriends(): BaseUser[]
	{
		return this.friends;
	}

	setFriends(friendArray : BaseUser[]): void
	{
		this.friends = friendArray;
	}
}

class RegisteredUser extends User
{
	accessToken: string | null;
	isRefreshed: boolean;
	hasTwoFactorAuth: boolean;

	constructor( id: number, accessToken: string, username?: string )
	{
		super(username || 'Loading...');
		this.id = id;
		this.accessToken = accessToken;
		this.isRefreshed = false;
		this.hasTwoFactorAuth = false;
	}
}

class GuestUser extends User
{
	constructor(username: string)
	{
		super(username);
	}
}



