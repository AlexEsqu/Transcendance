import db from "../../database.js";
import { server } from "../../server.js";

function deleteUser(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the user",
			security: [{ BearerAuth: [] }],
			params: {
				type: "object",
				properties: {
					id: { type: "integer", minimum: 1 },
				},
				required: ["id"],
			},
		},
		onRequest: [server.authenticate],
	};
	server.delete("/users/:id/delete", opts, (req, reply) => {
		const { id } = req.user;
		console.log(req.params.id);
		if (id != req.params.id) 
			return reply.status(401).send({ error: "Unauthorized" });

		db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
		reply.status(204).send();
	});
}

export default deleteUser;
