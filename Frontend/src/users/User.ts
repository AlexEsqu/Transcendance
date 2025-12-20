export {User, RegisteredUser, GuestUser }

const placeholderAvatar : string = "/assets/placeholder/avatarPlaceholder.png"

abstract class User {
	name: string;
	avatarPath: string;

	constructor(name: string)
	{
		this.name = name;
		this.avatarPath = placeholderAvatar;
	}

	getName(): string
	{
		return this.name;
	}

	getAvatarPath(): string
	{
		return this.avatarPath;
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



