import crypto from "crypto";
import { generateTokens } from "../../services/authServices.js";
import { twoFactorLoginSchema } from "../schemas/two-factor.schema.js";

export default function twoFactorLoginRoute(server) {
	const opts = {
		$ref: twoFactorLoginSchema,
	};
	server.post("/login/2fa", opts, async (req, reply) => {
		const { code } = req.body;
		const twoFactorToken = req.query.twoFactorToken;

		const user = server.db.prepare("SELECT code_hash_2fa, code_expires_2fa, id FROM users WHERE token_2fa = ?").get(twoFactorToken);
		if (!user) {
			return reply.status(401).send({ error: "Unauthorized", message: "Invalid token" });
		}
		if (user.code_expires_2fa < Date.now()) {
			return reply.status(401).send({ error: "Unauthorized", message: "Code expired" });
		}
		const inputHash = crypto.createHmac("sha256", process.env.OTP_SECRET).update(code).digest("hex");

		if (inputHash !== user.code_hash_2fa) {
			return reply.status(401).send({ error: "Unauthorized", message: "Invalid code" });
		}
		server.db.prepare(`UPDATE users SET code_hash_2fa = null,code_expires_2fa = null,token_2fa = null WHERE id = ?`).run(user.id);
		return generateTokens(server, user, reply);
	});
}
