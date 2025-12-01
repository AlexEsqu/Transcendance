import db from "../../database.js";

function getUserMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Returns a list of all matches that matches (lol) the user using the id parameter. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: {
				type: "object",
				properties: {
					user_id: { type: "integer", minimum: 1 },
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
			const user = db.prepare(`SELECT id FROM users WHERE id = ?`).get(user_id);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			const stmnt = db.prepare(`SELECT * FROM matches WHERE winner_id = ? OR loser_id = ?`);
			const matches = stmnt.all(user_id,user_id)
			reply.send({ matches });
		} catch (err) {
			console.log(err);
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default getUserMatches;
