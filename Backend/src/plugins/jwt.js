import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export default fp(async function (server) {
	server.register(jwt, {
		secret: process.env.JWT_SECRET,
	});

	server.decorate("authenticateUser", async function (req, reply) {
		try {
			await req.jwtVerify();
		} catch (err) {
			reply.send(err);
		}
	});
});


