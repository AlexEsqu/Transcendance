import crypto from "crypto";
import { sendEmailVerificationSchema } from "../../schemas/post.send-verify-email.schema.js";

export default function sendEmailVerificationRoute(server) {
	const opts = {
		schema: sendEmailVerificationSchema,
	};
	server.post("/send-mail-verification", opts, async (request, reply) => {
		const token = crypto.randomBytes(32).toString("hex");
		const expires = Date.now() + 1000 * 60 * 60; // 1 hour
		const verifyUrl = `${process.env.API_DOMAIN_NAME}/users/auth/verify-email?token=${token}`;

		const { email } = request.body;
		try {
			const user = await server.db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
			if (!user) {
				return reply.status(400).send({
					error: "Bad Request",
					message: "User not found",
				});
			}
			if (user.email_verified === 1) {
				return reply.status(400).send({
					error: "Bad Request",
					message: "Email already verified",
				});
			}
			// Update user with email verification token
			server.db.prepare(` UPDATE users SET email_verify_token = ?, email_verify_expires = ? WHERE email = ?`).run(token, expires, email);

			// Generate email verification token and send email
			await server.mailer.sendMail({
				from: `"Pong" <${process.env.GMAIL_USER}>`,
				to: email,
				subject: "Verify your email",
				html: `
      				<p>Click the link to verify your email:</p>
     				<a href="${verifyUrl}">${verifyUrl}</a>
    				`,
			});
			return reply.send({ success: true, message: "Verification email sent" });
		} catch (err) {
			reply.status(500).send({
				error: "Internal Server Error",
				message: err.message,
			});
		}
	});
}


