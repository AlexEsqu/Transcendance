import { createAccessToken, createRefreshToken, hashRefreshToken } from "../../services/authServices.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

export default function login(server) {
	const opts = {
		schema: {
			description:
				"Authenticates the user using their login (email or username) and password. \
				On success, returns a the user's id AND short-lived access token in the response body and sets a long-lived refresh token\
				 in the `HttpOnly refreshToken cookie`, which can later be used to obtain new access tokens. This endpoint requires the client to have validated their email.",
			tags: ["auth"],
			body: { $ref: "authCredentialsBody" },
			response: {
				200: {
					type: "object",
					properties: {
						accessToken: { type: "string" },
						id: { type: "integer" },
					},
					required: ["accessToken", "id"],
				},
				401: {
					description: "Unauthorized: Invalid credentials",
					$ref: "errorResponse#",
				},
				403: {
					description: "Forbidden: Email not verified",
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
	server.post("/login", opts, async (req, reply) => {
		try {
			const { login, password } = req.body;
			//looks for the user in the db if it exists

			const user = await server.db.prepare(`SELECT * FROM users WHERE email = ? OR username = ? `).get(login, login);

			if (!user) {
				return reply.status(401).send({ error: "Invalid credentials" });
			}
			if (!user.email_verified) {
				return reply.status(403).send({ error: "Email not verified" });
			}

			//checks if the password matches
			const match = await bcrypt.compare(password, user.password_hash);

			if (!match) {
				return reply.status(401).send({ error: "Invalid credentials" });
			}
			if (user.is_2fa_enabled) {
				const code = crypto.randomInt(100000, 999999).toString();
				const codeHash = crypto.createHmac("sha256", process.env.OTP_SECRET).update(code).digest("hex");

				const expires = Date.now() + 1000 * 60 * 5; // 5 minutes
				const twoFaToken = crypto.randomUUID();

				db.prepare(`UPDATE users SET code_hash_2fa = ?, code_expires_2fa = ?, token_2fa = ? WHERE id = ?`).run(codeHash, expires, twoFaToken, user.id);

				await server.mailer.sendMail({
					from: `"Pong" <${process.env.GMAIL_USER}>`,
					to: email,
					subject: "Your 6-digit verification code",
					html: `
      				<p>Your 6-digit verification code is: ${code}</p>
    				`,
				});
				reply.redirect(`/users/auth/login/2fa/?token=${twoFaToken}`);
			}

			const accessToken = createAccessToken(server, user.id, user.username);
			const refreshToken = createRefreshToken(server, user.id, user.username);

			const refreshTokenHash = await hashRefreshToken(refreshToken);
			const addRefreshToken = server.db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`);
			addRefreshToken.run(refreshTokenHash, user.id);
			// set cookie
			reply.setCookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/users/auth",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
			const id = user.id;

			reply.send({ accessToken, id });
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
