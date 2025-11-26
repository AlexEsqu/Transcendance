import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function (server, opts) {
	// Register JWT plugin
	server.register(jwt, {
		secret: process.env.JWT_SECRET,
	});

	// Decorate Fastify instance with 'authenticate' method
	server.decorate("authenticate", async function (request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
});
