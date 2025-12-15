// src/app.js
import Fastify from "fastify";
import fs from "fs";
import fastifyFormBody from "@fastify/formbody";
import fastifyMultiPart, { ajvFilePlugin } from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "node:path";

import db from "./database.js";
import clientAuthPlugin from "./plugins/validateApiKey.js";
import sessionAuthPlugin from "./plugins/validateSessionToken.js";
import authPlugin from "./plugins/jwt.js";
import swaggerPlugin from "./plugins/swagger.js";

import matchesRoutes from "./routes/matches/index.js";
import userRoutes from "./routes/users/index.js";
import authRoutes from "./routes/auth/index.js";

import {
	authCredentialsBody,
	errorResponse,
	SignupBody,
	SuccessMessageResponse,
	matchObject,
	userIdObject,
	publicUserObject,
} from "./schemas/schemas.js";

export function buildServer({
	useHttps = false,
	dbOverride = null,
	apiKeyPluginOverride = null,
	sessionPluginOverride = null,
	jwtFake = null, // optional fake jwt object { sign, verify }
} = {}) {
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
		origin: "*",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	});
	server.register(matchesRoutes);
	server.register(userRoutes);
	server.register(authRoutes);
	server.register(fastifyRateLimit, {
		max: 100,
		timeWindow: "1 minute",
		allowList: ["127.0.0.1"],
		ban: 2,
	});
	server.register(fastifyStatic, {
		root: path.join(process.env.AVATARS_UPLOAD_PATH || "./uploads"),
		prefix: "/avatars/",
	});

	// Schemas
	server.addSchema(authCredentialsBody);
	server.addSchema(errorResponse);
	server.addSchema(SignupBody);
	server.addSchema(SuccessMessageResponse);
	server.addSchema(matchObject);
	server.addSchema(userIdObject);
	server.addSchema(publicUserObject);

	return server;
}
