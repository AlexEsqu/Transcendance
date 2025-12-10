import db from "../../database.js";

function getMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Returns a list of all matches. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/matches", opts, (req, reply) => {
		try {
			const matches = server.db.prepare(`SELECT * FROM matches`).all();
			reply.send({ matches });
		} catch (err) {
			console.log(err)
			reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default getMatches;
