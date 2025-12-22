import bcrypt from "bcrypt";
import fp from "fastify-plugin";

export default fp(async (server) => {
	server.decorate("authenticateRefreshToken", async (request, reply) => {
		try {
			const { refreshToken } = request.cookies
			if (!refreshToken) {
				return reply.status(401).send({ error: "Missing refreshToken cookie" });
			}

			// Verify JWT structure and signature
			const payload = await server.jwt.verify(refreshToken);

			// Ensure token has an id
			if (!payload.id) {
				return reply.status(401).send({error:"Unauthorized" ,message: "Invalid refresh token" });
			}

			// Get stored hash from DB
			const row = server.db.prepare(`SELECT refresh_token_hash FROM users WHERE id = ?`).get(payload.id);

			if (!row?.refresh_token_hash) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid refresh token" });
			}

			// Compare token to stored hash
			const match = await bcrypt.compare(refreshToken, row.refresh_token_hash);

			if (!match) {
				return reply.status(401).send({ error: "Unauthorized", message: "Invalid refresh token" });
			}

			request.user = { payload }
		} catch (err) {
			if (err.name === "TokenExpiredError") {
				return reply.status(401).send({ error:"Unauthorized" ,message: "Refresh token expired" });
			}

			// Log unexpected errors only
			if (!["UnauthorizedError", "JsonWebTokenError"].includes(err.name)) {
				console.log(err);
			}

			return reply.status(401).send({error:"Unauthorized" , message: "Invalid refresh token" });
		}
	});
});
