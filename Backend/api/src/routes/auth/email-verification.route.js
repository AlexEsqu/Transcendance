import { verifyEmailSchema } from "../schemas/email-verification.schema.js";


export default function verifyEmail(server) {
	const opts = {
		$ref: verifyEmailSchema,	
	};
	server.get("/verify-email", opts, async (request, reply) => {
		try {
			const { token } = request.query;
			if (!token) throw new VerificationError("Missing token", 400);
			const user = server.db.prepare(`SELECT email_verify_expires, id FROM users WHERE email_verify_token = ?`).get(token);

			if (!user) {
				resetEmailVerificationToken(server, user);
				throw new VerificationError("Invalid token", 400);
			}
			if (!user.email_verify_expires || user.email_verify_expires < Date.now()) {
				resetEmailVerificationToken(server, user);
				throw new VerificationError("Verification token has expired", 400);
			}
			server.db.prepare(`UPDATE users SET email_verify_token = NULL, email_verify_expires = NULL, email_verified = 1 WHERE id = ?`).run(user.id);
			return reply.redirect(`${process.env.FRONTEND_DOMAIN_NAME}/connection/login?verified=true`);
		} catch (error) {
			if (token) {
				resetEmailVerificationToken(server, user);
			}
			if (err instanceof VerificationError) {
				return reply.status(err.statusCode).send({
					error: err.name,
					message: err.message,
				});
			}

			return reply.status(500).send({
				error: "Internal Server Error",
				message: error.message,
			});
		}
	});
}

function resetEmailVerificationToken(server, user) {
	server.db.prepare(`UPDATE users SET email_verify_token = NULL, email_verify_expires = NULL, email_verified = 0 WHERE id = ?`).run(user.id);
}
