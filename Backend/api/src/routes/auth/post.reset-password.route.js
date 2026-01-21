import { postResetPasswordSchema } from "../../schemas/post.reset-password.schema.js";

export default function postResetPassword(server) {
	const opts = {
		schema: postResetPasswordSchema,
		onRequest: [server.authenticateClient],
	};
	server.post("/reset-password", opts, async (req, reply) => {
		try {
			const { email } = req.body;
			const user = await server.db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
			const resetLink = `${process.env.API_DOMAIN_NAME}/users/auth/reset-password`;
			if (!user) {
				return reply.status(200).send({ success: true, message: "Password reset email sent" });
			}
			const token = crypto.randomBytes(32).toString("hex");
			const expires = Date.now() + 1000 * 60 * 15; // 15 minutes
			server.db.prepare(`UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?`).run(token, expires, email);
			await server.mailer.sendMail({
				from: `"Pong" <${process.env.GMAIL_USER}>`,
				to: email,
				subject: "Password reset",
				html: `<p>
				You have requested to reset your Pong password.
				<br>
				Click the link to reset your password:
				<br>
				<a href="${resetLink}?token=${token}">Click here to reset your password</a>
				<br>
				</p>`,
			});
			return reply.status(200).send({ success: true, message: "Password reset email sent" });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal Server Error", message: err.message });
		}
	});
}
