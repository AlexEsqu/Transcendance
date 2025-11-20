// ESM
import Fastify from 'fastify'
import root from './routes/root.js'
const fastify = Fastify({
	logger: true,
});

fastify.register(root);

/**
 * Run the server!
 */
const start = async () => {
	try {
		await fastify.listen({
			port: process.env.PORT || 3000,
			host: process.env.ADDRESS || "0.0.0.0",
		});
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
