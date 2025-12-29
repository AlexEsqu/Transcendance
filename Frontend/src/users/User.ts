export {User, RegisteredUser, GuestUser }

const placeholderAvatar : string = "/assets/placeholder/avatarPlaceholder.png"

abstract class User {
	id: number | null;
	username: string;
	avatar: string;
	friends: User[];
	is_active: boolean;

	constructor(username: string)
	{
		this.id = null;
		this.username = username;
		this.avatar = placeholderAvatar;
		this.friends = [];
		this.is_active = true;
	}

	getName(): string
	{
		return this.username;
	}

	getAvatarPath(): string
	{
		return this.avatar;
	}

	getFriends(): User[]
	{
		return this.friends;
	}

	setFriends(friendArray : User[]): void
	{
		this.friends = friendArray;
	}
}

class RegisteredUser extends User
{
	accessToken: string | null;

	constructor(username: string, id: number, accessToken: string)
	{
		super(username);
		this.id = id;
		this.accessToken = accessToken;
	}
}

class GuestUser extends User
{
	constructor(username: string)
	{
		super(username);
	}

	rename(newName : string): void
	{
		this.username = newName;
	}
}



