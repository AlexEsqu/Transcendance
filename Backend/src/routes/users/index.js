import { getUser, getUsers } from "./getUsers.js";
import deleteUser from "./deleteUser.js";
import putUserPassword from "./putUserPassword.js";
import putUserAvatar from "./putUserAvatar.js";
import deleteUserAvatar from "./deleteUserAvatar.js";
import getFriends from "./friends/getFriends.js";
import addFriend from "./friends/postFriend.js";
import deleteFriend from "./friends/deleteFriend.js";
import putUsername from "./putUsername.js";

export default async function userRoutes(server) {
	server.register(getUsers);
	server.register(getUser);
	server.register(putUserPassword, { prefix: "users" });
	server.register(putUserAvatar, { prefix: "users" });
	server.register(putUsername, { prefix: "users" })
	server.register(deleteUserAvatar, { prefix: "users" });
	server.register(addFriend, { prefix: "users" });
	server.register(deleteFriend, { prefix: "users" })
	server.register(deleteUser, { prefix: "users" });
	server.register(getFriends, { prefix: "users" });
}
