import fastify from "fastify";

const app = fastify();

const start = async () => {
	try {
		app.listen({
			port: process.env.PORT || 3000,
			host: process.env.ADDRESS || "0.0.0.0",
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};
start();
