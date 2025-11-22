// ESM
import Fastify from 'fastify'
import fs from "fs";
import root from './routes/root.js'
const app = Fastify({
  logger: true,
  https: {
    key: fs.readFileSync("/tmp/certs/server.key"),
    cert: fs.readFileSync("/tmp/certs/server.crt")
  }
});


app.register(root);

/**
 * Run the server!
 */
const start = async () => {
	try {
		await app.listen({
			port: process.env.PORT,
			host: process.env.ADDRESS ,
		});
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start();
