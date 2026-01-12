import { updateUsernameSchema } from "../schemas/username.schema.js";

export default function updateUsername(server) {
	const opts = {
		$ref: updateUsernameSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/username", opts, async (req, reply) => {
		try {
			const newUsername = req.body.new_username;
			const { id } = req.user;

			server.db.prepare(`UPDATE users SET username = ? WHERE id = ?`).run(newUsername, id);
			reply.status(200).send({ success: true, message: "Updated username successfully" });
		} catch (err) {
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				return reply.status(409).send({ error: "Conflict", message: "Username is taken already" });
			}
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
