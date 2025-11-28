import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

export default fp(async (server, opts) => {
	// Security aliases
	server.decorate("security", {
		UserAuth: [{ BearerAuth: [] }],
		SessionAuth: [{ cookieAuth: [] }],
		AppAuth: [{ AppClientAuth: [] }],
		UserAndApp: [{ BearerAuth: [] }, { AppClientAuth: [] }],
		SessionAndApp: [{ cookieAuth: [] }, { AppClientAuth: [] }],
		UserAndSession: [{ BearerAuth: [] }, { cookieAuth: [] }],
	});

	// Register Swagger
	await server.register(swagger, {
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
					AppClientAuth: {
						type: "apiKey",
						in: "header",
						name: "X-App-Secret",
					},
				},
			},
			tags: [
				{ name: "auth", description: "Auth endpoints" },
				{ name: "user", description: "User endpoints" },
				{ name: "matches", description: "Matches endpoints" },
			],
		},
		exposeRoute: true,
	});

	server.register(swaggerUI, {
		routePrefix: "/docs",
		swagger: { url: "/docs/json" },
		uiConfig: {
			deepLinking: false,
		},
		staticCSP: true,
	});
});
