import fs from "fs";

export default function deleteUserAvatar(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the avatar of the user. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
			response: {
				204: { type: "null" },
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
	server.delete("/me/avatar", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			//retrive avatar path
			const { avatar_path } = server.db.prepare(`SELECT avatar_path FROM users WHERE id = ?`).get(id);

			if (avatar_path) {
				server.db.prepare(`UPDATE users SET avatar_path = NULL WHERE id = ?`).run(id);

				fs.unlink(avatar_path, () => {
					console.log(avatar_path + " was deleted");
				});
			}
			reply.status(204).send();
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
