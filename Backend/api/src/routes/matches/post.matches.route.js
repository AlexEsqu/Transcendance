import { postMatchesSchema } from "../../schemas/post.matches.schema.js";

export function postMatches(server) {
	const opts = {
		schema: postMatchesSchema,
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
			if (!winner && (winner_id != 0 || winner_id != -1)) {
				return reply.code(400).send({ error: "Invalid winner_id (user not found)" });
			}
			if (!loser && (loser_id != 0 || loser_id != -1)) {
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
			console.log(err);
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}
