import db from "../database.js";
import { server } from "../app.js";
import bcrypt from "bcrypt";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
	fastify.decorate("authenticateRefreshToken", async (request, reply) => {
		const { refreshToken } = request.cookies;

		if (!refreshToken) {
			return reply.status(401).send({ error: "Missing refreshToken cookie" });
		}

		// Verify signature (ensures token is structurally valid)
		const { id } = await server.jwt.verify(refreshToken);

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
	});
});
