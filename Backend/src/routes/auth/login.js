import { generateTokens } from "../../services/authServices.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

export default function login(server) {
	const opts = {
		schema: {
			description:
				"Authenticates the user using their login (email or username) and password. \
   If authentication succeeds and two-factor authentication (2FA) is disabled, \
   the endpoint returns the user's id and a short-lived access token in the response body \
   and sets a long-lived refresh token in an HttpOnly `refreshToken` cookie. \
   \
   If 2FA is enabled for the user, the endpoint does not issue tokens immediately. \
   Instead, a one-time 6-digit verification code is sent to the user's email and \
   a temporary 2FA continuation token is generated, which must be used to complete \
   authentication via the 2FA verification endpoint. \
   `This endpoint requires the client to have a verified email address.`",
			tags: ["auth"],
			body: { $ref: "authCredentialsBody" },
			response: {
				200: {
					oneOf: [
						{
							description: "Login successful",
							type: "object",
							required: ["accessToken", "id"],
							properties: {
								accessToken: { type: "string" },
								id: { type: "integer" },
							},
						},
						{
							description: "Two-factor authentication required",
							type: "object",
							required: ["twoFactorRequired", "token"],
							properties: {
								twoFactorRequired: { type: "boolean", example: true },
								token: { type: "string", description: "2FA continuation token" },
							},
						},
					],
				},
				302: {
					description: "Redirect: Email not verified",
					$ref: "SuccessMessageResponse#",
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
			console.log(user);
			if (!user) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid credentials" });
			}
			if (!user.email_verified) {
				return reply.status(403).send({ error: "Forbidden", message: "Email not verified" });
			}

			//checks if the password matches
			const match = await bcrypt.compare(password, user.password_hash);

			if (!match) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid credentials" });
			}
			if (user.is_2fa_enabled) {
				const twoFaToken = await sendVerificationCodeEmail(server, user);
				return reply.status(200).send({
					twoFactorRequired: true,
					token: twoFaToken,
				});
			}
			const tokens = await generateTokens(server, user, reply);
			return reply.status(200).send(tokens);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
