import fs from "fs";

//TODO: GDPR => DONT FORGET TO ANONIMIZE THE USER EVERYWHERE IN DB
function deleteUser(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the user account and all its data. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
			response: {
				204: {
					description: "Success: User deleted successfully",
					type: "null",
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
	server.delete("/me", opts, (req, reply) => {
		try {
			const { id } = req.user;
			//delete the users avatar from db
			const { avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);
			if (avatar) {
				fs.unlink(avatar, () => {
					console.log(avatar + " was deleted");
				});
			}
			server.db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
			reply.status(204).send();
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default deleteUser;
