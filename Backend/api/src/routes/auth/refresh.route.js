import { createRefreshToken, createAccessToken, hashRefreshToken } from "../../services/authServices.js";
import { refreshSchema } from "../../schemas/refresh.schema.js";

function refresh(server) {
	const opts = {
		schema: refreshSchema,
		onRequest: [server.authenticateClient, server.authenticateRefreshToken],
	};
	server.post("/refresh", opts, async (req, reply) => {
		try {
			const { id, username } = req.user;
			// Create new access token
			const newAccessToken = createAccessToken(server, id, username);

			// Rotate refresh token
			const newRefreshToken = createRefreshToken(server, id, username);
			const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
			console.log("upadting refresh token");
			// Save new refresh token hash in DB
			server.db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`).run(newRefreshTokenHash, id);
			// Send new refresh token to user
			reply.clearCookie("refreshToken", {
				httpOnly: true,
				secure: true, // REQUIRED (HTTPS)
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});
			// Send new refresh token to user
			reply.setCookie("refreshToken", newRefreshToken, {
				httpOnly: true,
				secure: true, // REQUIRED (HTTPS)
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});

			// Send access token
			return reply.send({ accessToken: newAccessToken , id: id});
		} catch (err) {
			console.log(err);
			return reply.status(401).send({ error: "Invalid token" });
		}
	});
}

export default refresh;
