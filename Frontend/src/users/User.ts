export {User, RegisteredUser, GuestUser }

const placeholderAvatar : string = "/assets/placeholder/avatarPlaceholder.png"

abstract class User {
	name: string;
	avatarPath: string;
	friends: User[];
	isActive: boolean;

	constructor(name: string)
	{
		this.name = name;
		this.avatarPath = placeholderAvatar;
		this.friends = [];
		this.isActive = true;
	}

	getName(): string
	{
		return this.name;
	}

	getAvatarPath(): string
	{
		return this.avatarPath;
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
	id: number | null;
	accessToken: string | null;

	constructor(name: string, id: number, accessToken: string)
	{
		super(name);
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
		this.name = newName;
	}

}



