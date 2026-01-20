import fp from "fastify-plugin";

export default fp(async (server) => {
	server.decorate("authenticateClient", async (request, reply) => {
		const apiKey = request.headers["x-app-secret"];

		if (!apiKey || apiKey !== process.env.APP_SECRET_KEY) {
			reply.code(401).send({ error: "Unauthorized" , message: "Invalid API key"});
		}
	});

});
