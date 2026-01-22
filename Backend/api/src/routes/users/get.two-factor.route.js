import { getTwoFactorSchema } from "../../schemas/get.two-factor.schema.js";

export function getTwoFactor(server) {
	const opts = {
		schema: getTwoFactorSchema,
		onRequest: [server.authenticateUser],
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
