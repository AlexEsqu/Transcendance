import { getResetPasswordSchema } from "../../schemas/get.reset-password.schema.js";

export default function getResetPassword(server) {
	const opts = {
		schema: getResetPasswordSchema,
	};
	server.get("/reset-password", opts, async (req, reply) => {
		const { token } = req.query;
		try {
			const user = server.db.prepare(`SELECT * FROM users WHERE reset_password_token = ?`).get(token);
			if (!user) {
				reply.status(400).send({ error: "Bad Request", message: "Invalid token" });
			}
			if (!user.reset_password_token_expires || user.reset_password_token_expires < Date.now()) {
				resetPasswordVerificationToken(server, user);
				reply.status(400).send({ error: "Bad Request", message: "Verification token has expired" });
			}
			resetPasswordVerificationToken(server, user);
			return reply.redirect(`${process.env.FRONTEND_DOMAIN_NAME}/reset-password`);
		} catch (err) {
			console.log(err);
			if (token) {
				resetPasswordVerificationToken(server, user);
			}
			return reply.status(500).send({
				error: "Internal Server Error",
				message: err.message,
			});
		}
	});
}

function resetPasswordVerificationToken(server, user) {
	console.log("Resetting email verification token");
	server.db.prepare(`UPDATE users SET reset_password_token = NULL, reset_password_token_expires = NULL WHERE id = ?`).run(user.id);
}
