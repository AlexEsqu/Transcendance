import { deleteUserAvatar, putUserAvatar } from "./avatar.route.js";
import deleteUser from "./delete-me.route.js";
import { addFriend, deleteFriend, getFriends } from "./friends/friends.route.js";
import { getUser, getUsers } from "./list.route.js";
import { postUserPassword, putUserPassword } from "./password.route.js";
import { getTwoFactorStatusRoute, updateTwoFactorStatusRoute } from "./two-factor.route.js";
import updateUsername from "./username.route.js";

export default async function userRoutes(server) {
	server.register(getUsers, { prefix: "api" });
	server.register(getUser, { prefix: "api" });
	server.register(putUserPassword, { prefix: "api/users" });
	server.register(postUserPassword, { prefix: "api/users" })
	server.register(putUserAvatar, { prefix: "api/users" });
	server.register(updateUsername, { prefix: "api/users" });
	server.register(deleteUserAvatar, { prefix: "api/users" });
	server.register(addFriend, { prefix: "api/users" });
	server.register(deleteFriend, { prefix: "api/users" });
	server.register(deleteUser, { prefix: "api/users" });
	server.register(getFriends, { prefix: "api/users" });
	server.register(updateTwoFactorStatusRoute, { prefix: "api/users" });
	server.register(getTwoFactorStatusRoute, { prefix: "api/users" });
}
