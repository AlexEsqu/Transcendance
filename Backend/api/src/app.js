// src/app.js
import Fastify from "fastify";
import fs from "fs";
import fastifyFormBody from "@fastify/formbody";
import fastifyMultiPart, { ajvFilePlugin } from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Schemas from "./schemas/index.js";
import db from "./database.js";
import clientAuthPlugin from "./plugins/client-auth.js";
import sessionAuthPlugin from "./plugins/refresh-auth.js";
import authPlugin from "./plugins/user-auth.js";
import swaggerPlugin from "./plugins/swagger.js";
import mailerPlugin from "./plugins/mailer.js";

import Routes from "./routes/index.js";

export function buildServer({ useHttps = null, dbOverride = null, apiKeyPluginOverride = null, sessionPluginOverride = null, jwtFake = null, mailerOverride = null } = {}) {
	const server = Fastify({
		https: useHttps
			? {
					key: fs.readFileSync("/tmp/certs/server.key"),
					cert: fs.readFileSync("/tmp/certs/server.crt"),
			  }
			: undefined,
		ajv: {
			plugins: [ajvFilePlugin],
			customOptions: { allErrors: true, strict: false },
		},
	});

	// Register DB
	server.register(dbOverride ?? db);

	// Register API key and session plugins (allow overrides)
	server.register(apiKeyPluginOverride ?? clientAuthPlugin);
	server.register(sessionPluginOverride ?? sessionAuthPlugin);

	// Other plugins
	server.register(fastifyFormBody);
	server.register(fastifyMultiPart, { attachFieldsToBody: true });
	server.register(authPlugin, { jwtFake }); // allow passing a fake jwt object
	server.register(fastifyCookie);
	server.register(swaggerPlugin);
	server.register(cors, {
		origin:`${process.env.API_DOMAIN_NAME}`,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		logLevel: "trace",
	});

	server.register(Schemas);
	server.register(Routes);
	// Register routes
	server.register(fastifyRateLimit, {
		max: 100,
		timeWindow: "1 minute",
		allowList: ["127.0.0.1"],
		ban: 2,
	});
	server.register(fastifyStatic, {
		root: process.env.AVATARS_UPLOAD_PATH,
		prefix: "/api/avatars/",
	});
	server.register(mailerOverride ?? mailerPlugin);

	return server;
}
