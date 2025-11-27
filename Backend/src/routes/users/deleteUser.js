import db from "../../database.js";
import { server } from "../../server.js";

function deleteUser(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the user",
			security: [{ BearerAuth: [] }],
		},
		onRequest: [server.authenticate],
	};
	server.delete("/users/me", opts, (req, reply) => {
		const { id } = req.user;
		db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
		reply.status(204).send();
	});
}

export default deleteUser;
