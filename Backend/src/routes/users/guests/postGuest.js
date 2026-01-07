export default function postGuest(server) {
	const opts = {
		schema: {
			tags: ["guests"],
			description: "Add a guest",
			security: server.security.AppAuth,
			body: {
				type: "object",
				required: ["alias"],
				properties: {
					alias: {
						type: "string",
						description: "Alias chosen by user",
					},
				},
			},
			response: {
				201: {
					type: "object",
					properties: {
						id: { type: "string" },
						alias: { type: "string" },
						sessionToken: { type: "string" },
					},
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
	server.post("/guests", opts, async (req, reply) => {
		try {
			let guest = {};
			guest.id = `guest:${crypto.randomUUID()}`;
			guest.alias = req.body.alias;
			guest.sessionToken = server.jwt.sign(
				{ id: guest.id },
				{ alias: guest.alias },
				{ expiresIn: `1440m` }, // 1day
				{ type: "guest" }
			);
			return reply.status(201).send(guest);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
