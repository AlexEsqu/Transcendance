// ESM
import Fastify from "fastify";
import fs from "fs";
import fastifyFormBody from "@fastify/formbody";
import fastifyMultiPart from "@fastify/multipart";
import authPlugin from "./plugins/jwt.js";
import swaggerPlugin from "./plugins/swagger.js";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";

import clientAuthPluggin from "./plugins/validateApiKey.js";
import { getUsers, getUser } from "./routes/users/getUsers.js";
import yaml from "yaml";
import postUser from "./routes/users/signup.js";
import login from "./routes/auth/login.js";
import refresh from "./routes/auth/refresh.js";
import logout from "./routes/auth/logout.js";
import deleteUser from "./routes/users/deleteUser.js";
import patchUserPassword from "./routes/users/patchUserPassword.js";
import patchUserInfo from "./routes/users/patchUserInfo.js";
import postMatches from "./routes/matches/postMatch.js";
import getMatches from "./routes/matches/getMatches.js";
import getUserMatches from "./routes/matches/getUserMatches.js";

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
server.register(swaggerPlugin);
server.register(clientAuthPluggin);
// server.register(cors, {
// 	origin: "*", // allow all origins;
// 	methods: ["GET", "PATCH", "POST", "DELETE"],
// });

server.register(cors, { origin: '*', credentials: true, })

//ROUTES
server.register(getUsers);
server.register(getUser);
server.register(postUser, { prefix: "users" });
server.register(login, { prefix: "users" });
server.register(refresh, { prefix: "users" });
server.register(logout, { prefix: "users" });
server.register(deleteUser, { prefix: "users" });
server.register(patchUserPassword, { prefix: "users" });
server.register(patchUserInfo, { prefix: "users" });
server.register(postMatches);
server.register(getMatches);
server.register(getUserMatches);

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
// // write the api as yaml

// server.ready((err) => {
// 	if (err) throw err;

// 	const openapiObject = server.swagger();

// 	// Convert JSON -> YAML
// 	const yamlString = yaml.stringify(openapiObject);

// 	// Write file
// 	fs.writeFileSync("/app/docs/api.yaml", yamlString);

// 	console.log("📄 OpenAPI YAML file generated at docs/openapi.yaml");
// });
