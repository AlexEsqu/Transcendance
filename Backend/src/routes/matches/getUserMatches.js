export default function getUserMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Returns a list of all the matches of a user using the user_id parameter. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: { $ref: "userIdObject#" },
			response: {
				200: {
					type: "array",
					items: { $ref: "matchObject#" },
				},
				401: {
					description: "Unauthorized: Invalid credentials",
					$ref: "errorResponse#",
				},
				404: {
					description: "Not Found: User not found",
					$ref: "errorResponse#",
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/matches/:user_id", opts, async (req, reply) => {
		try {
			const { user_id } = req.params;
			const user = server.db.prepare(`SELECT id FROM users WHERE id = ?`).get(user_id);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			const stmnt = server.db.prepare(`SELECT * FROM matches WHERE winner_id = ? OR loser_id = ?`);
			const matches = stmnt.all(user_id, user_id);
			console.log(matches);
			return reply.status(200).send(matches);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
