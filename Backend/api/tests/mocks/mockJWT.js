import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function (server) {
	server.register(jwt, {
		secret: process.env.JWT_SECRET,
	});

	server.decorate("authenticateUser", async function (req, res, next) {
		// Mock implementation
		if (req.headers.authorization === "Bearer invalidToken") {
			throw new Error("Invalid token");
		}
		req.user = {
			id: 1,
			username: "user1",
		};
		next();
	});
});
