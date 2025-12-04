import db from "../../database.js";
//Schema that serves an user

export function getUser(server) {
	const singleUserSchema = {
		schema: {
			tags: ["user"],
			description: "Returns an object of an user using the id passed in parameters. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
			params: {
				type: "object",
				properties: {
					id: { type: "integer", minimum: 1 },
				},
				required: ["id"],
			},

			response: {
				200: {
					type: "object",
					properties: {
						id: { type: "integer" },
						username: { type: "string" },
						avatar_url: { type: "string" },
					},
				},
			},
		},
		onRequest: [server.authenticateClient],
	};

	server.get("/users/:id", singleUserSchema, (req, res) => {
		try {
			const { id } = req.params;
			const user = db.prepare(`SELECT id, username, avatar_url FROM users WHERE id = ?`).get(id);
			if (!user) {
				return res.status(404).send({ error: "User not found" });
			}
			if (user.avatar_url) {
				user.avatar_url = user.avatar_url.replace(process.env.AVATARS_UPLOAD_PATH, `${process.env.DOMAIN_NAME}avatars/`);
			}
			console.log(user);
			res.send(user);
		} catch (err) {
			console.log(err);
			return res.status(500).send({ error: "Internal server error" });
		}
	});
}

export function getUsers(server) {
	const allUsersSchema = {
		schema: {
			tags: ["user"],
			security: server.security.AppAuth,
			description: "Returns a list of all registered users. `This endpoint requires client authentication.`",
			security: server.security.AppAuth,
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
	server.get("/users", allUsersSchema, (req, res) => {
		const users = db.prepare(`SELECT id, username, avatar_url FROM users`).all();
		users.forEach((user) => {
			if (user.avatar_url) {
				user.avatar_url = user.avatar_url.replace(process.env.AVATARS_UPLOAD_PATH, `${process.env.DOMAIN_NAME}avatars/`);
			}
		});

		console.log(users);
		res.send(users);
	});
}
