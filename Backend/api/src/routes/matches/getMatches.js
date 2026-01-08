export default function getMatches(server) {
	const opts = {
		schema: {
			tags: ["matches"],
			description: "Returns a list of all matches. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			response: {
				200: {
					type: "array",
					items: { $ref: "matchObject#" },
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
