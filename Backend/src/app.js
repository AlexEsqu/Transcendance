// Modules
import Fastify from "fastify";
import fs from "fs";
import fastifyFormBody from "@fastify/formbody";
import fastifyMultiPart, { ajvFilePlugin } from "@fastify/multipart";
import authPlugin from "./plugins/jwt.js";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { authCredentialsBody, errorResponse, SignupBody, SuccessMessageResponse, matchObject, userIdObject ,publicUserObject} from "./schemas/schemas.js";

//Plugins
import clientAuthPluggin from "./plugins/validateApiKey.js";
import sessionAuthPluggin from "./plugins/validateSessionToken.js";
import swaggerPlugin from "./plugins/swagger.js";
//Routes
import matchesRoutes from "./routes/matches/index.js";
import userRoutes from "./routes/users/index.js";
import authRoutes from "./routes/auth/index.js";
import db from "./database.js";
export const server = Fastify({
	https: {
		key: fs.readFileSync("/tmp/certs/server.key"),
		cert: fs.readFileSync("/tmp/certs/server.crt"),
	},
	ajv: {
		plugins: [ajvFilePlugin],
	}
});

server.register(db);

// MODULES
server.register(clientAuthPluggin);
server.register(sessionAuthPluggin);

server.register(fastifyFormBody);
server.register(fastifyMultiPart, {
	attachFieldsToBody: true,
});
server.register(authPlugin);
server.register(fastifyCookie);
server.register(swaggerPlugin);
server.register(cors, { origin: "*", credentials: true, methods: ["GET", "POST", "PUT", "DELETE"] });
//Routes
server.register(matchesRoutes);
server.register(userRoutes);
server.register(authRoutes);
server.register(fastifyRateLimit, {
	max: 100, // max requests
	timeWindow: "1 minute",
	allowList: ["127.0.0.1"], // trusted IPs
	ban: 2, // auto-ban after too many violations
});

server.register(fastifyStatic, {
	root: path.join(process.env.AVATARS_UPLOAD_PATH),
	prefix: "/avatars/",
});

//Schema

server.addSchema(authCredentialsBody);
server.addSchema(errorResponse);
server.addSchema(SignupBody);
server.addSchema(SuccessMessageResponse);
server.addSchema(matchObject);
server.addSchema(userIdObject);
server.addSchema(publicUserObject)