import db from "../../database.js";

function postMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Records a completed match between two users, including winner, loser, scores, and match date. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			body: {
				type: "object",
				required: ["winner_id", "loser_id", "winner_score", "loser_score", "date"],
				properties: {
					winner_id: { type: "integer" },
					loser_id: { type: "integer" },
					winner_score: { type: "integer" },
					loser_score: { type: "integer" },
					date: { type: "string", format: "date-time" },
				},
			},
		},
		onRequest: [server.authenticateClient],
		preHandler: async (req, reply) => {
			const { winner_id, loser_id } = req.body;
			const stmnt = db.prepare(`SELECT id from users WHERE id = ?`);
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
			const stmnt = db.prepare(`INSERT INTO matches (winner_id, loser_id, winner_score ,loser_score, date) VALUES (?,?,?,?,?)`);
			stmnt.run(match.winner_id, match.loser_id, match.winner_score, match.loser_score, match.date);
			reply.status(200).send({ success: true, message: "Match added successfully" });
		} catch (err) {
			console.log(err);
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default postMatches;
