import db from "../../database.js";

function getUserMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Returns a list of all the matches of a user using the user_id parameter. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: {
				type: "object",
				properties: {
					user_id: { type: "integer"},
				},
				required: ["user_id"],
			},
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/matches/:user_id", opts, (req, reply) => {
		try {
			const { user_id } = req.params;
			console.log(req.params)
			const user = server.db.prepare(`SELECT id FROM users WHERE id = ?`).get(user_id);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			const stmnt = server.db.prepare(`SELECT * FROM matches WHERE winner_id = ? OR loser_id = ?`);
			const matches = stmnt.all(user_id,user_id)
			reply.send({ matches });
		} catch (err) {
			server.log.error(err);
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default getUserMatches;
