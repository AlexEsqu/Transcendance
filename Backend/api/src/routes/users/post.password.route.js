import bcrypt from "bcrypt";
import { getUserbyId, incrementRefreshTokenVersion } from "../../utils/utils.js";
import { postUserPasswordSchema } from "../../schemas/post.password.schema.js";

export function postUserPassword(server) {
	const opts = {
		schema: postUserPasswordSchema,
		onRequest: [server.authenticateUser],
	};
	server.post("/me/password", opts, async (req, reply) => {
		try {
			const { password } = req.body;
			const { id } = req.user;
			const user = await getUserbyId(id, server.db);
			console.log(user);
			if (user.oauth_provider && !user.password_hash) {
				//hash password and update db
				const password_hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
				server.db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(password_hash, id);
				incrementRefreshTokenVersion(server.db, id);
				reply.clearCookie("refresh_token");
				reply.status(200).send({ success: true, message: "Set password successfully" });
			}
			reply.status(403).send({ error: "Forbidden", message: 'You already have a password, please use the "Change Password" button' });
		} catch (err) {
			console.log(err);
		}
	});
}
