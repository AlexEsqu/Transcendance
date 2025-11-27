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
import refresh from "./routes/auth/refresh.js";
import logout from "./routes/auth/logout.js";
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
		info: { title: "My API", version: "1.0.0" },
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
				cookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "refreshToken",
				},
			},
		},
		tags: [
			{ name: "auth", description: "Auth endpoints" },
			{ name: "user", description: "User endpoints" },
		],
	},
	exposeRoute: true,
});

server.register(swaggerUI, {
	routePrefix: "/docs",
	swagger: { url: "/docs/json" },
	uiConfig: {
		docExpansion: "full",
		deepLinking: false,
	},
	staticCSP: true,
});

//ROUTES
server.register(getUsers, { prefix: "/api" });
server.register(getUser, { prefix: "/api" });
server.register(postUser, { prefix: "/api" });
server.register(login, { prefix: "/api" });
server.register(refresh, { prefix: "/api" });
server.register(logout, { prefix: "/api" });

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
