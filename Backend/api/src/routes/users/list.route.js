import { formatUserObject, getUserbyId } from "../../utils/utils.js";
import { getUserSchema , getUsersSchema} from "../../schemas/list.schema.js";

export function getUser(server) {
	const singleUserSchema = {
		$ref: getUserSchema,
		onRequest: [server.authenticateClient],
	};
	server.get("/users/:id", singleUserSchema, async (req, reply) => {
		try {
			const { id } = req.params;

			const user = await getUserbyId(id, server.db);
			console.log(user);

			if (!user) {
				return reply.status(404).send({ error: "Not Found", message: "User not found" });
			}
			formatUserObject(user);
			return reply.status(200).send(user);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export function getUsers(server) {
	const opts = {
		$ref: getUsersSchema,
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
