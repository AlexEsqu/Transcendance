import { getMeSchema } from "../../schemas/me.schema.js";
import { formatUserObject, getUserbyId } from "../../utils/utils.js";

export async function getMe(server) {
	const opts = {
		schema: getMeSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.get("/me", opts, async (req, reply) => {
		try {
			const { id } = req.user;
			const user = await getUserbyId(id, server.db);

			if (!user) {
				return reply.status(404).send({ error: "Not Found", message: "User not found" });
			}
			delete user.password_hash;
			delete user.refresh_token_hash;
			delete user.code_hash_2fa;
			delete user.code_expires_2fa;
			delete user.code_attempts_2fa;
			delete user.email_verify_token;
			delete user.email_verify_expires;

			const stmnt = server.db.prepare(`SELECT * FROM matches WHERE winner_id = ? OR loser_id = ?`);
			const matches = stmnt.all(id, id);
			user.matches = matches;
			formatUserObject(user);
			console.log(user);
			return reply.status(200).send(user);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
