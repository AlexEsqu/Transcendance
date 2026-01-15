import { postMatchSchema, getUserMatchesSchema, getMatchesSchema } from "../../schemas/matches.schema.js";
export function getUserMatches(server) {
	const opts = {
		schema: getUserMatchesSchema,
		onRequest: [server.authenticateClient],
	};
	server.get("/:id/matches", opts, async (req, reply) => {
		try {
			const { id } = req.params;
			if (id != 0) {
				const user = server.db.prepare(`SELECT id FROM users WHERE id = ?`).get(id);
				if (!user) {
					return reply.status(404).send({ error: "Not Found", message: "User not found" });
				}
			}

			const stmnt = server.db.prepare(`SELECT * FROM matches WHERE winner_id = ? OR loser_id = ?`);
			const matches = stmnt.all(id, id);
			console.log(matches);
			return reply.status(200).send(matches);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export function getMatches(server) {
	const opts = {
		schema: getMatchesSchema,
		onRequest: [server.authenticateClient],
	};
	server.get("/matches", opts, (req, reply) => {
		try {
			const matches = server.db.prepare(`SELECT * FROM matches`).all();
			return reply.status(200).send(matches);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export function postMatches(server) {
	const opts = {
		schema: postMatchSchema,
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
			if (!winner && winner_id != 0) {
				return reply.code(400).send({ error: "Invalid winner_id (user not found)" });
			}
			if (!loser && loser_id != 0) {
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
