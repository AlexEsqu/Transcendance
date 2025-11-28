import db from "../../database.js";

function getMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			desciption: "Get matches",
			security: server.security.AppAuth,
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/matches", opts, (req, reply) => {
		try {
			const matches = db.prepare(`SELECT * FROM matches`).all();
			reply.send({ matches });
		} catch (err) {
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default getMatches;
