import { createRefreshToken, createAccessToken, hashRefreshToken } from "../../services/authServices.js";

function refresh(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description:
				"Uses the refresh token to issue a new access token. The endpoint verifies the refresh token, checks that it is not expired or revoked. This endpoint requires `client authentification` AND `user authentification` AND the refresh cookie stored in the `HttpOnly refreshToken cookie`",
			security: server.security.UserAndSession,
			response: {
				200: {
					description: "Returns new access token",
					type: "object",
					properties: {
						accessToken: { type: "string" },
					},
					required: ["accessToken"],
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
		onRequest: [server.authenticateUser, server.authenticateClient, server.authenticateRefreshToken],
	};
	server.post("/refresh", opts, async (req, reply) => {
		try {
			const { refreshToken } = req.cookies;

			const { id, username } = await server.jwt.verify(refreshToken);

			// Create new access token
			const newAccessToken = createAccessToken(server, id, username);

			// Rotate refresh token
			const newRefreshToken = createRefreshToken(server, id, username);
			const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
			console.log("upadting refresh token");
			// Save new refresh token hash in DB
			server.db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`).run(newRefreshTokenHash, id);

			// Send new refresh token to user
			reply.setCookie("refreshToken", newRefreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/users/auth",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});

			// Send access token
			return reply.send({ accessToken: newAccessToken });
		} catch (err) {
			console.log(err);
			return reply.status(401).send({ error: "Invalid token" });
		}
	});
}

export default refresh;
