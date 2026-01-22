/* eslint-disable no-undef */
import { getVerifyEmailSchema } from "../../schemas/get.verify-email.schema.js";

export default function getVerifyEmail(server) {
	const opts = {
		schema: getVerifyEmailSchema,
	};
	server.get("/verify-email", opts, async (request, reply) => {
		const { token } = request.query;
		try {
			if (!token) {
				throw new Error("Missing token", 400);
			}
			const user = server.db.prepare(`SELECT email_verify_expires, id FROM users WHERE email_verify_token = ?`).get(token);
			if (!user) {
				console.log("User not found");
				throw new Error("Invalid token", 400);
			}
			if (!user.email_verify_expires || user.email_verify_expires < Date.now()) {
				resetEmailVerificationToken(server, user);
				throw new Error("Verification token has expired", 400);
			}
			server.db.prepare(`UPDATE users SET email_verify_token = NULL, email_verify_expires = NULL, email_verified = 1 WHERE id = ?`).run(user.id);
			return reply.redirect(`${process.env.FRONTEND_DOMAIN_NAME}/connection/login?verified=true`);
		} catch (error) {
			console.log(error);
			if (token) {
				resetEmailVerificationToken(server, user);
			}
			if (error instanceof Error) {
				return reply.status(error.statusCode).send({
					error: error.name,
					message: error.message,
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
	console.log("Resetting email verification token");
	server.db.prepare(`UPDATE users SET email_verify_token = NULL, email_verify_expires = NULL, email_verified = 0 WHERE id = ?`).run(user.id);
}
