import { getUser, getUsers } from "./getUsers.js";
import postUser from "./signup.js";
import deleteUser from "./deleteUser.js";
import patchUserPassword from "./patchUserPassword.js";
import patchUserAvatar from "./patchUserAvatar.js";
import deleteUserAvatar from "./deleteUserAvatar.js";
import getFriends from "./friends/getFriends.js";
import addFriend from "./friends/postFriend.js";
import deleteFriend from "./friends/deleteFriend.js";
import patchUsername from "./patchUsername.js";

export default async function userRoutes(server) {
	server.register(getUsers);
	server.register(getUser);
	server.register(postUser, { prefix: "users" });
	server.register(patchUserPassword, { prefix: "users" });
	server.register(patchUserAvatar, { prefix: "users" });
	server.register(patchUsername, { prefix: "users" })
	server.register(deleteUserAvatar, { prefix: "users" });
	server.register(addFriend, { prefix: "users" });
	server.register(deleteFriend, { prefix: "users" })
	server.register(deleteUser, { prefix: "users" });
	server.register(getFriends, { prefix: "users" });
}
