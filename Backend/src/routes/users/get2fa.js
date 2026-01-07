export default function get_2fa_status(server) {
	const opts = {
		schema: {
			description: "Returns 2fa activation status",
			security: server.security.UserAuth,
			tags: ["user"],
			response: {
				200: {
					description: "Returns 2fa activation status",
					type: "object",
					required: ["is_2fa_enabled"],
					properties: { is_2fa_enabled: { type: "boolean" } },
				},
				401: {
					description: "Unauthorized: Invalid credentials",
					$ref: "errorResponse#",
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
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.get("/me/2fa", opts, async (req, reply) => {
		try {
			const user = req.user;
			const { is_2fa_enabled } = await server.db.prepare(`SELECT is_2fa_enabled FROM users where id = ?`).get(user.id);
			return reply.status(200).send({ is_2fa_enabled: is_2fa_enabled ? true : false });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
