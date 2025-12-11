import { createAccessToken, createRefreshToken, hashRefreshToken } from "../../services/authServices.js";
import bcrypt from "bcrypt";

export default function login(server) {
	const opts = {
		schema: {
			description:
				"Authenticates the user using their username and password. On success, returns a the user's id AND short-lived access token in the response body and sets a long-lived refresh token in the `HttpOnly refreshToken cookie`, which can later be used to obtain new access tokens.",
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

	server.post("/auth/login", opts, async (req, reply) => {
		try {
			const { username, password } = req.body;

			//looks for the user in the db if it exists
			const user = await server.db.prepare(`SELECT password_hash, id FROM users WHERE username = ? `).get(username);
			if (!user) {
				return reply.status(401).send({ error: "Invalid credentials" });
			}
			//checks if the password matches
			const match = await bcrypt.compare(password, user.password_hash);

			if (!match) {
				return reply.status(401).send({ error: "Invalid credentials" });
			} else {
				const accessToken = createAccessToken(user.id, username, server.db);
				const refreshToken = createRefreshToken(user.id, username);

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
			}
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
