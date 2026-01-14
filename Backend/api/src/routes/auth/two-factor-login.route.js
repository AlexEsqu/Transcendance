import crypto from "crypto";
import { generateTokens } from "../../services/authServices.js";
import { twoFactorLoginSchema } from "../../schemas/two-factor.schema.js";
import { getUserbyId } from "../../utils/utils.js";

export default function twoFactorLoginRoute(server) {
	const opts = {
		schema: twoFactorLoginSchema,
	};
	server.post("/login/2fa", opts, async (req, reply) => {
		const { code } = req.body;
		const userId = req.cookies.pending_2fa_uid;
		if(!userId){
			return reply.status(401).send({ error: "Unauthorized", message: "Invalid user" });
		}
		const user = getUserbyId(userId, server.db);
		reply.clearCookie("pending_2fa_uid");
		if (!user) {
			return reply.status(401).send({ error: "Unauthorized", message: "Invalid user" });
		}
		if (user.code_expires_2fa < Date.now()) {
			return reply.status(401).send({ error: "Unauthorized", message: "Code expired" });
		}
    	const inputHash = crypto.createHash("sha256").update(code).digest("hex");
		if (inputHash !== user.code_hash_2fa) {
			server.db.prepare(`UPDATE users SET code_attempts_2fa = code_attempts_2fa + 1 WHERE id = ?`).run(user.id);
			return reply.status(401).send({ error: "Unauthorized", message: "Invalid code" });
		}
		server.db.prepare(`UPDATE users SET code_hash_2fa = null, code_expires_2fa = null WHERE id = ?`).run(user.id);
		reply.clearCookie("pending_2fa_uid");
		return generateTokens(server, user, reply);
	});
}
