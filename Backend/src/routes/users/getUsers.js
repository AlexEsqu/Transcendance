import { modifyUserAvatarKeyName } from "../../utils/utils.js";
//Schema that serves an user

export function getUser(server) {
	const singleUserSchema = {
		schema: {
			tags: ["user"],
			description: "Returns an object of an user using the id passed in parameters. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: { $ref: "userIdObject#" },
			response: {
				200: { $ref: "publicUserObject#" },
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
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
		onRequest: [server.authenticateClient],
	};

	server.get("/users/:id", singleUserSchema, (req, reply) => {
		try {
			const { id } = req.params;
			const user = server.db.prepare(`SELECT id, username, avatar_path FROM users WHERE id = ?`).get(id);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			modifyUserAvatarKeyName(user);
			console.log(user);
			reply.send(user);
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
			description: "Returns a list of all registered users. `This endpoint requires client authentication.`",
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "integer" },
							username: { type: "string" },
							avatar_url: { type: "string" },
						},
					},
				},
			},
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/users", allUsersSchema, (req, reply) => {
		const users = server.db.prepare(`SELECT id, username, avatar_path FROM users`).all();
		users.forEach((user) => {
			modifyUserAvatarKeyName(user);
		});

		console.log(users);
		reply.send(users);
	});
}
