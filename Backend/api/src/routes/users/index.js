import { getUser, getUsers } from "./getUsers.js";
import deleteUser from "./deleteUser.js";
import putUserPassword from "./putUserPassword.js";
import putUserAvatar from "./putUserAvatar.js";
import deleteUserAvatar from "./deleteUserAvatar.js";
import getFriends from "./friends/getFriends.js";
import addFriend from "./friends/postFriend.js";
import deleteFriend from "./friends/deleteFriend.js";
import putUsername from "./putUsername.js";
import toggle_2fa from "./toggle2fa.js";
import get_2fa_status from "./get2fa.js";
import postGuest from "./guests/postGuest.js";
import postUserPassword from "./postPassword.js";

export default async function userRoutes(server) {
	server.register(getUsers, { prefix: "api" });
	server.register(getUser, { prefix: "api" });
	server.register(putUserPassword, { prefix: "api/users" });
	server.register(postUserPassword, { prefix: "api/users" })
	server.register(putUserAvatar, { prefix: "api/users" });
	server.register(putUsername, { prefix: "api/users" });
	server.register(deleteUserAvatar, { prefix: "api/users" });
	server.register(addFriend, { prefix: "api/users" });
	server.register(deleteFriend, { prefix: "api/users" });
	server.register(deleteUser, { prefix: "api/users" });
	server.register(getFriends, { prefix: "api/users" });
	server.register(toggle_2fa, { prefix: "api/users" });
	server.register(get_2fa_status, { prefix: "api/users" });
	server.register(postGuest, {prefix : "api"})
}
