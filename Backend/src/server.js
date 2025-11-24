// ESM
import Fastify from 'fastify'
import fs from "fs";
import db from './database.js';
import getUsers from './routes/getUsers.js';
import getUser from './routes/getUser.js';

export const server = Fastify({
  https: {
    key: fs.readFileSync("/tmp/certs/server.key"),
    cert: fs.readFileSync("/tmp/certs/server.crt")
  }
});


server.register(getUsers, { prefix: "/api" });
server.register(getUser, { prefix: "/api" });

/**
 * Run the server!
 */
const start = async () => {
	try {
		server.listen({
			port: process.env.PORT,
			host: process.env.ADDRESS ,
		});
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};
start();
