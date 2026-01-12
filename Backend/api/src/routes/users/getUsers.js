import { formatUserObject, getUserbyId } from "../../utils/utils.js";
//Schema that serves an user

export function getUser(server) {
	const singleUserSchema = {
		schema: {
			tags: ["user"],
			description:
				"Returns an object of an user using the id passed in parameters. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: { $ref: "userIdObject#" },
			response: {
				200: { $ref: "publicUserObject#" },
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				401: {
					description: "Unauthorized: Invalid credentials",
					$ref: "errorResponse#",
				},
				404: {
					description: "Not Found: User not found",
					$ref: "errorResponse#",
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						error: { type: "string" },
						message: { type: "string" },
					},
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
		onRequest: [server.authenticateClient],
	};

	server.get("/users/:id", singleUserSchema, async (req, reply) => {
		try {
			const { id } = req.params;

			const user = await getUserbyId(id, server.db);
			console.log(user);

			if (!user) {
				return reply.status(404).send({ error: "Not Found" , message: "User not found"});
			}
			formatUserObject(user);
			return reply.status(200).send(user);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export function getUsers(server) {
	const allUsersSchema = {
		schema: {
			tags: ["user"],
			security: server.security.AppAuth,
			description:
				"Returns a list of all registered users. `This endpoint requires client authentication.`",
			response: {
				200: {
					type: "array",
					items: { $ref: "publicUserObject#" },
				},
			},
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/users", allUsersSchema, (req, reply) => {
		const users = server.db
			.prepare(`SELECT id, username, avatar, last_activity, oauth_provider FROM users`)
			.all();
		users.forEach((user) => {
			formatUserObject(user);
		});
		reply.send(users);
	});
}
