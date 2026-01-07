export default function toggle_2fa(server) {
	const opts = {
		schema: {
			description: "Enable or disable 2FA for the authenticated user.",
			security: server.security.UserAuth,
			tags: ["user"],
			body: {
				required: ["enabled"],
				properties: {
					enabled: { type: "boolean" },
				},
			},
			response: {
				200: { description: " 2FA status updated successfully ", $ref: "SuccessMessageResponse#" },
			},
		},
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/2fa", opts, async (req, reply) => {
		try {
			const { enabled } = req.body;
			const user = req.user;

			server.db.prepare(`UPDATE users SET is_2fa_enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, user.id);
			return reply.status(200).send({ success: true, message: `2FA status updated successfully to ${enabled}` });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
