import { formatUserObject } from "../../utils/utils.js";
import { getUsersSchema} from "../../schemas/get.users.schema.js";

export function getUsers(server) {
	const opts = {
		schema: getUsersSchema,
		onRequest: [server.authenticateClient],
	};
	server.get("/users", opts, (req, reply) => {
		const users = server.db.prepare(`SELECT id, username, avatar, last_activity, oauth_provider FROM users`).all();
		users.forEach((user) => {
			formatUserObject(user);
		});
		reply.send(users);
	});
}
