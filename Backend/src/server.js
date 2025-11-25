// ESM
import Fastify from 'fastify'
import fs from "fs";
import fastifyFormBody from '@fastify/formbody'
import fastifyMultiPart from '@fastify/multipart'
import {getUsers, getUser} from './routes/get/getUsers.js';
import postUser from './routes/post/postUser.js';

export const server = Fastify({
  https: {
    key: fs.readFileSync("/tmp/certs/server.key"),
    cert: fs.readFileSync("/tmp/certs/server.crt")
  }
});

server.register(fastifyFormBody);
server.register(fastifyMultiPart);
server.register(getUsers, { prefix: "/api" });
server.register(getUser, { prefix: "/api" });
server.register(postUser, { prefix: "/api" });

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
