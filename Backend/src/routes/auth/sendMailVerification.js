import crypto from "crypto";
export default function sendMailVerification(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description: "Sends an email verification email to the user's email address",
			body: {
				type: "object",
				required: ["email"],
				properties: {
					email: { type: "string", format: "email" },
				},
			},
			response: {
				200: {
					description: "Success: Email verification email sent",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
	};
	server.post("/send-mail-verification", opts, async (request, reply) => {
		const token = crypto.randomBytes(32).toString("hex");
		const expires = Date.now() + 1000 * 60 * 60; // 1 hour
		const verifyUrl = `${process.env.DOMAIN_NAME}/users/auth/verify-email?token=${token}`;

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
