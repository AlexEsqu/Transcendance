export default function postMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Records a completed match between two users, including winner, loser, scores, and match date. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			body: { $ref: "matchObject" },
			response: {
				200: {
					description: "Uploaded new match successfully",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
								401: {
					description: "Unauthorized: Invalid credentials",
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
		preHandler: async (req, reply) => {
			//Verifies the users ids
			const { winner_id, loser_id } = req.body;
			const stmnt = server.db.prepare(`SELECT id from users WHERE id = ?`);
			const winner = stmnt.get(winner_id);
			const loser = stmnt.get(loser_id);
			if (winner_id == loser_id) {
				return reply.code(400).send({ error: "Invalid winner_id and loser_id (users are the same)" });
			}
			if (!winner) {
				return reply.code(400).send({ error: "Invalid winner_id (user not found)" });
			}
			if (!loser) {
				return reply.code(400).send({ error: "Invalid loser_id (user not found)" });
			}
		},
	};
	server.post("/matches", opts, async (req, reply) => {
		try {
			const match = req.body;
			const stmnt = server.db.prepare(`INSERT INTO matches (winner_id, loser_id, winner_score ,loser_score, date) VALUES (?,?,?,?,?)`);
			stmnt.run(match.winner_id, match.loser_id, match.winner_score, match.loser_score, match.date);
			reply.status(200).send({ success: true, message: "Match added successfully" });
		} catch (err) {
			server.log.error(err);
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}
