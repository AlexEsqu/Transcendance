export function login(server) {
	const opts = {
		schema: {
			params: {
				type: "object",
				proprieties: {
					username: { type: "string" },
					password: { type: "string" },
				},
				required: ["username", "password"],
			},
		},

		onRequest: [fastify.authenticate],
	};
	server.post("/auth/login", opts);

}
