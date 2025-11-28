import { createRefreshToken, createAccessToken, hashRefreshToken } from "../../services/authServices.js";
import db from "/app/src/database.js";
import bcrypt from "bcrypt";

function refresh(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description: "Send refresh token in HttpOnly cookie called `refreshToken`",
			security: server.security.UserAndSession, 
			parameters: [
				{
					name: "refreshToken",
					in: "cookie",
					description: "HttpOnly refresh token cookie, sent automatically by the browser",
					required: true,
					schema: { type: "string" },
				},
			],
			response: {
				200: {
					description: "New access token",
					type: "object",
					properties: {
						accessToken: { type: "string" },
					},
					required: ["accessToken"],
				},
				401: { description: "Unauthorized" },
			},
		},
	};
	server.post("/auth/refresh", opts, async (req, reply) => {
		try {
			const { refreshToken } = req.cookies;

			if (!refreshToken) {
				return reply.status(401).send({ error: "Missing refreshToken cookie" });
			}

			// Verify signature (ensures token is structurally valid)
			const { id, username } = await server.jwt.verify(refreshToken);

			// Get stored hash from DB
			const row = db.prepare(`SELECT refresh_token_hash FROM users WHERE id = ?`).get(id);

			if (!row) {
				return reply.status(401).send({ error: "Unauthorized" });
			}

			const storedHash = row.refresh_token_hash;

			// Compare raw refresh token with stored hash
			const match = await bcrypt.compare(refreshToken, storedHash);

			if (!match) {
				return reply.status(401).send({ error: "Unauthorized" });
			}

			// Create new access token
			const newAccessToken = createAccessToken(id, username);

			// Rotate refresh token
			const newRefreshToken = createRefreshToken(id, username);
			const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);

			// Save new refresh token hash in DB
			db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`).run(newRefreshTokenHash, id);

			// Send new refresh token to user
			reply.setCookie("refreshToken", newRefreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "api/auth/refresh",
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
