import { generateTokens, sendVerificationCodeEmail } from "../../services/authServices.js";
import bcrypt from "bcrypt";
import { loginSchema } from "../../schemas/post.login.schema.js";

export default function login(server) {
	const opts = {
		schema: loginSchema,
	};
	server.post("/login", opts, async (req, reply) => {
		try {
			const { login, password } = req.body;

			//looks for the user in the db if it exists
			const user = await server.db.prepare(`SELECT * FROM users WHERE email = ? OR username = ? `).get(login, login);
			if (!user) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid credentials" });
			}
			if (!user.email_verified) {
				return reply.status(403).send({ error: "Forbidden", message: "Email not verified" });
			}
			if (!user.password_hash) {
				return reply.status(400).send({
					error: "Bad Request",
					message: "This account uses OAuth. Please log in with 42 or set a password.",
				});
			}
			//checks if the password matches
			const match = await bcrypt.compare(password, user.password_hash);
			if (!match) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid credentials" });
			}
			if (user.is_2fa_enabled) {
				sendVerificationCodeEmail(server, user, reply);
				reply.setCookie("pending_2fa_uid", user.id, {
					httpOnly: true,
					sameSite: "lax",
					secure: true,
					path: "/api/users/auth/",
					maxAge: 60 * 60, // 1 hour
				});
				return reply.status(200).send({ twoFactorRequired: true });
			}
			const tokens = await generateTokens(server, user, reply);
			return reply.status(200).send(tokens);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
