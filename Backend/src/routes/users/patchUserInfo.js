import db from "/app/src/database.js";

export default function patchUserInfo(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.UserAuth,
			body: {
				type: "object",
				properties: {
					profilePictureUrl: { type: "string" },
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
	server.patch("/users/me", opts, async (req, reply) => {
		try {
			const { profilePictureUrl } = req.body;
			const { id } = req.user;
			db.prepare(`UPDATE users SET profile_image_url = ? WHERE id = ?`).run(profilePictureUrl, id);
			reply.status(200).send({ success: true });
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
