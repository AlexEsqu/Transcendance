import fastify from "fastify";

const app = fastify();

const start = async () => {
	try {
		await app.listen({port: 3000});
	} catch (err) {
		console.log("error");
		console.error(err);
		process.exit(1);
	}
};

start();