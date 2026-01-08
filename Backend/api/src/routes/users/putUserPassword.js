import bcrypt from "bcrypt";

// TODO: https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
//DELOG USER
export default function putUserPassword(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.UserAuth,
			description: "Modifies the password of the user. `This endpoint requires client AND user authentication.`",
			body: {
				type: "object",
				required: ["oldPassword", "newPassword"],
				properties: {
					oldPassword: { type: "string" },
					newPassword: { type: "string", minLength: 8 },
				},
				additionalProperties: false,
			},
			response: {
				200: {
					description: "Updated password successfully",
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
	server.put("/me/password", opts, async (req, reply) => {
		try {
			const { oldPassword, newPassword } = req.body;
			const { id } = req.user;
			//check the old password compared to the hash in db
			const data = server.db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(id);
			const match = await bcrypt.compare(oldPassword, data.password_hash);
			if (!match) {
				return reply.status(401).send({ error: "Incorrect old password" });
			}
			//if ok, hash new password and update db
			const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
			server.db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newPasswordHash, id);
			reply.status(200).send({ success: true, message: "Updated password successfully" });
		} catch (err) {
			console.log(err);
		}
	});
}
