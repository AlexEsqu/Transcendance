import { putTwoFactorSchema } from "../../schemas/put.two-factor.schema.js";

export function putTwoFactor(server) {
	const opts = {
		schema: putTwoFactorSchema,
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
