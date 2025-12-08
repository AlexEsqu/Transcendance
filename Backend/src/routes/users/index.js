import { server } from "../../app.js";
import { getUser, getUsers } from "./getUsers.js";
import postUser from "./signup.js";
import deleteUser from "./deleteUser.js";
import patchUserPassword from "./patchUserPassword.js";
import patchUserAvatar from "./patchUserAvatar.js";
import deleteUserAvatar from "./deleteUserAvatar.js";


export default async function userRoutes(server) {
	server.register(getUsers);
	server.register(getUser);
	server.register(postUser, { prefix: "users" });
	server.register(deleteUser, { prefix: "users" });
	server.register(patchUserPassword, { prefix: "users" });
	server.register(patchUserAvatar, { prefix: "users" });
	server.register(deleteUserAvatar, { prefix: "users" })
}
