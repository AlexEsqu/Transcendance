export default function putUsername(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.UserAuth,
			description: "Modifies the username of the user. `This endpoint requires client AND user authentication.`",
			body: {
				type: "object",
				required: ["new_username"],
				properties: {
					new_username: { type: "string" },
				},
				additionalProperties: false,
			},
			response: {
				200: {
					description: "Updated username successfully",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
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
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/username", opts, async (req, reply) => {
		try {
			const newUsername = req.body.new_username;
			const { id } = req.user;

			server.db.prepare(`UPDATE users SET username = ? WHERE id = ?`).run(newUsername, id);
			reply.status(200).send({ success: true, message: "Updated username successfully" });
		} catch (err) {
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				return reply.status(400).send({ error: "Username is taken already" });
			}
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
