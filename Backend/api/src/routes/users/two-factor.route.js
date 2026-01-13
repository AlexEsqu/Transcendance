import { getTwoFactorStatusSchema, updateTwoFactorStatusSchema } from "../../schemas/two-factor.schema.js";

export function getTwoFactorStatusRoute(server) {
	const opts = {
		$ref: getTwoFactorStatusSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.get("/me/2fa", opts, async (req, reply) => {
		try {
			const user = req.user;
			const result = await server.db.prepare(`SELECT is_2fa_enabled FROM users where id = ?`).get(user.id);
			return reply.status(200).send({ is_2fa_enabled: result?.is_2fa_enabled ? true : false });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export function updateTwoFactorStatusRoute(server) {
	const opts = {
		$ref: updateTwoFactorStatusSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/2fa", opts, async (req, reply) => {
		try {
			const { enabled } = req.body;
			const user = req.user;

			server.db.prepare(`UPDATE users SET is_2fa_enabled = ? WHERE id = ?`).run(enabled ? 1 : 0, user.id);
			console.log(`2FA status updated successfully to ${enabled}`);
			return reply.status(200).send({ success: true, message: `2FA status updated successfully to ${enabled}` });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
