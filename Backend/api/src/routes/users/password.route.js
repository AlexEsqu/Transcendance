import bcrypt from "bcrypt";
import { getUserbyId, incrementRefreshTokenVersion } from "../../utils/utils.js";
import { putUserPasswordSchema, postUserPasswordSchema } from "../../schemas/password.schema.js";
import { get } from "http";

// TODO: https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
//DELOG USER
export function putUserPassword(server) {
	const opts = {
		schema: putUserPasswordSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/password", opts, async (req, reply) => {
		try {
			const { oldPassword, newPassword } = req.body;
			const { id } = req.user;
			//check the old password compared to the hash in db
			const data = server.db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(id);
			const match = await bcrypt.compare(oldPassword, data.password_hash);
			if (!match) {
				return reply.status(401).send({ error: "Incorrect old password" });
			}
			//if ok, hash new password and update db
			const newPasswordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
			server.db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newPasswordHash, id);
			incrementRefreshTokenVersion(server.db, id);
			reply.clearCookie("refresh_token");
			server.mailer.sendMail({
				from: `"Pong" <${process.env.GMAIL_USER}>`,
				to: getUserbyId(id, server.db).email,
				subject: "Password changed",
				html: `<p>
				Your Pong account password was changed.
				<br>
				If you did this, no further action is needed.
				If you didn't, please reset your password immediately.</p>`,
			});
			reply.status(200).send({ success: true, message: "Updated password successfully" });
		} catch (err) {
			console.log(err);
		}
	});
}

export function postUserPassword(server) {
	const opts = {
		schema: postUserPasswordSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
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
