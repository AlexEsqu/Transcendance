// ESM
import Fastify from "fastify";
import fs from "fs";
import fastifyFormBody from "@fastify/formbody";
import fastifyMultiPart from "@fastify/multipart";
import authPlugin from "./plugins/jwt.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";

import { getUsers, getUser } from "./routes/users/getUsers.js";
import postUser from "./routes/users/userSignup.js";
import login from "./routes/auth/login.js";
export const server = Fastify({
	https: {
		key: fs.readFileSync("/tmp/certs/server.key"),
		cert: fs.readFileSync("/tmp/certs/server.crt"),
	},
});

// MODULES
server.register(fastifyFormBody);
server.register(fastifyMultiPart);
server.register(authPlugin);
server.register(fastifyCookie);

server.register(swagger, {
	openapi: {
		info: {
			title: "My API",
			description: "API documentation for my Fastify app",
			version: "1.0.0",
		},
		tags: [
			{ name: "user", description: "User related end-points" },
			{ name: "auth", description: "Auth related end-points" },
			{ name: "games", description: "Game related end-points" },
		],
	},
});

server.register(swaggerUI, {
	routePrefix: "/docs", // Swagger UI available at https://localhost:8443/docs
	swagger: {
		info: {
			title: "My API",
			version: "1.0.0",
		},
	},
	uiConfig: {
		docExpansion: "full",
	},
	staticCSP: true,
});
//ROUTES
server.register(getUsers, { prefix: "/api" });
server.register(getUser, { prefix: "/api" });
server.register(postUser, { prefix: "/api" });
server.register(login, { prefix: "/api" });

/**
 * Run the server!
 */
const start = async () => {
	try {
		server.listen({
			port: process.env.PORT,
			host: process.env.ADDRESS,
		});
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};
start();
