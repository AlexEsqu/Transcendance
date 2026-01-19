import { changeEmailSchema } from "../../schemas/change-email.schema.js";
import crypto from "crypto";
export async function changeEmail(server) {
	const opts = {
		schema: changeEmailSchema,
		onRequest: [server.authenticateUser],
	};
	server.put("/me/change-email", opts, async (req, reply) => {
		try {
			const newEmail = req.body.email.toLowerCase();
			const { id } = req.user;
			const { email } = server.db.prepare(`SELECT email FROM users WHERE id = ?`).get(id);

			const isTaken = server.db.prepare(`SELECT email FROM users WHERE email = ? `).get(newEmail);
			const token = crypto.randomBytes(32).toString("hex");
			const expires = Date.now() + 1000 * 60 * 5; // 5 minutes

			if (isTaken) {
				return reply.status(409).send({ error: "Conflict", message: "Email is taken already" });
			}
			server.db.prepare(`UPDATE users SET pending_email = ?, 
							email_change_token = ?, 
							email_change_expires = ? 
							WHERE id = ?`)
						.run(newEmail, token, expires, id);
			let idx = newEmail.indexOf("@");
			const censoredEmail = newEmail.replace(newEmail.slice(1, idx), "*".repeat(5));
			await server.mailer.sendMail({
				from: `"Pong" <${process.env.GMAIL_USER}>`,
				to: email,
				subject: "Email change request",
				html: `
					<p>Someone requested to change your email to ${censoredEmail}.
					Please confirm the change by clicking the link below:</p>
					<a href="${process.env.API_DOMAIN_NAME}/users/confirm-email-change?token=${token}">Confirm email change</a>
					<p>If you did not request this change, please ignore this email.</p>	
				`,
			});
			
			return reply.status(200).send({ success: true, message: "Requested email change successfully" });
		} catch (err) {
			console.log(err);
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				return reply.status(409).send({ error: "Conflict", message: "Email is taken already" });
			}
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
