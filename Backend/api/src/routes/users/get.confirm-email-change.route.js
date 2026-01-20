import { confirmEmailChangeSchema } from "../../schemas/get.confirm-email-change.schema.js";

export async function confirmEmailChange(server) {
	const opts = {
		schema: confirmEmailChangeSchema,
	};
	server.get("/confirm-email-change", opts, async (req, reply) => {
		const { token } = req.query;
		let user;
		try {
			if (!token) {
				throw new Error("Missing token", 400);
			}
			user = server.db.prepare(`SELECT email_change_expires, id FROM users WHERE email_change_token = ?`).get(token);
			if (!user) {
				console.log("User not found");
				throw new Error("Invalid token", 400);
			}
			if (!user.email_change_expires || user.email_change_expires < Date.now()) {
				resetEmailChangeToken(server, user);
				throw new Error("Verification token has expired", 400);
			}
			server.db.prepare(`UPDATE users SET email = pending_email WHERE id = ?`).run(user.id);
			server.db
			.prepare(`UPDATE users 
				SET email_change_token = NULL, 
				email_change_expires = NULL, 
				pending_email = NULL, 
				email_verified = 0 
				WHERE id = ?`).run(user.id);
			incrementRefreshTokenVersion(server.db, id);
			reply.clearCookie("refresh_token");
			return reply.redirect(`${process.env.FRONTEND_DOMAIN_NAME}/settings?email_change=true`);
		} catch (error) {
			console.log(error);
			if (token) {
				resetEmailChangeToken(server, user);
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

function resetEmailChangeToken(server, user) {
	console.log("Resetting email verification token");
	server.db.prepare(`UPDATE users SET email_change_token = NULL, email_change_expires = NULL WHERE id = ?`).run(user.id);
}

