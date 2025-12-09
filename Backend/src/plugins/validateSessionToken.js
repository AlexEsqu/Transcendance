import db from "../database.js";
import bcrypt from "bcrypt";
import fp from "fastify-plugin";

export default fp(async (server) => {
	server.decorate("authenticateRefreshToken", async (request) => {
		try {
			const { refreshToken } = request.cookies;

			if (!refreshToken) {
				throw server.httpErrors.unauthorized("Missing refreshToken cookie");
			}

			// Verify signature (ensures token is structurally valid)
			const { id } = await server.jwt.verify(refreshToken);

			// Get stored hash from DB
			const row = db.prepare(`SELECT refresh_token_hash FROM users WHERE id = ?`).get(id);
			if (!row) {
				throw server.httpErrors.unauthorized("Unauthorized");
			}

			const storedHash = row.refresh_token_hash;

			// Compare raw refresh token with stored hash
			const match = await bcrypt.compare(refreshToken, storedHash);

			if (!match) {
				throw server.httpErrors.unauthorized("Unauthorized");
			}
		} catch (err) {
			server.log.error(err);
			if (err.name === "TokenExpiredError") {
				throw server.httpErrors.unauthorized("Refresh token expired");
			}
			throw server.httpErrors.unauthorized("Invalid refresh token");
		}
	});
});
