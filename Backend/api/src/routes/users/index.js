import { deleteUserAvatar } from "./delete.avatar.route.js";
import { putUserAvatar } from "./put.avatar.route.js";
import deleteMe from "./delete.me.route.js";
import { postFriend } from "./friends/post.friends.route.js";
import { deleteFriend } from "./friends/delete.friends.route.js";
import { getFriends } from "./friends/get.friends.route.js";
import { getUser } from "./get.user.route.js";
import { getUsers } from "./get.users.route.js";
import { postUserPassword } from "./post.password.route.js";
import { putUserPassword } from "./put.password.route.js";
import { getTwoFactor } from "./get.two-factor.route.js";
import { putTwoFactor } from "./put.two-factor.route.js";
import putUsername from "./put.username.route.js";
import { getMe } from "./get.me.route.js";
import { putChangeEmail } from "./put.change-email.route.js";
import { getConfirmEmailChange } from "./get.confirm-email-change.route.js";

export default async function userRoutes(server) {
	server.register(getMe, { prefix: "api/users" });
	server.register(getUsers, { prefix: "api" });
	server.register(getUser, { prefix: "api" });
	server.register(putUserPassword, { prefix: "api/users" });
	server.register(postUserPassword, { prefix: "api/users" })
	server.register(putUserAvatar, { prefix: "api/users" });
	server.register(putUsername, { prefix: "api/users" });
	server.register(deleteUserAvatar, { prefix: "api/users" });
	server.register(postFriend, { prefix: "api/users" });
	server.register(deleteFriend, { prefix: "api/users" });
	server.register(deleteMe, { prefix: "api/users" });
	server.register(getFriends, { prefix: "api/users" });
	server.register(putTwoFactor, { prefix: "api/users" });
	server.register(getTwoFactor, { prefix: "api/users" });
	server.register(putChangeEmail, { prefix: "api/users" });
	server.register(getConfirmEmailChange, { prefix: "api/users" });
}
