import db from "/app/src/database.js";
import bcrypt from "bcrypt";

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
					type: "object",
					properties: {
						success: { type: "boolean" },
					},
				},
			},
		},
		onRequest: [server.authenticateUser],
	};
	server.patch("/me/password", opts, async (req, reply) => {
		try {
			const { oldPassword, newPassword } = req.body;
			const { id } = req.user;
			//check the old password compared to the hash in db
			const data = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(id);
			const match = await bcrypt.compare(oldPassword, data.password_hash);
			if (!match) {
				return reply.status(400).send({ error: "Old password incorrect" });
			}
			//if ok, hash new password and update db
			const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
			db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newPasswordHash, id);
			reply.status(200).send({ success: true });
		} catch (err) {
			console.log(err);
		}
	});
}
