import { getUserMatchesSchema, getMatchesSchema } from "../../schemas/get.matches.schema.js";

export function getUserMatches(server) {
	const opts = {
		schema: getUserMatchesSchema,
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
