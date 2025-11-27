import db from "../../database.js";
//Schema that serves an user

const singleUserSchema = {
	schema: {
		tags: ["user"],
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
					profile_image_url: { type: "string" },
				},
			},
		},
	},
};

export function getUser(server) {
	server.get("/users/:id", singleUserSchema, (req, res) => {
		const { id } = req.params;
		console.log(id);
		const user = db.prepare(`SELECT id, username, profile_image_url,  FROM users WHERE id = ?`).get(id);
		if (!user) {
			return res.status(404).send({ error: "User not found" });
		}
		console.log(user);
		res.send(user);
	});
}

//Schema that serves an array of users
const allUsersSchema = {
	schema: {
		tags: ["user"],
		response: {
			200: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "integer" },
						username: { type: "string" },
						profile_image_url: { type: "string" },
					},
				},
			},
		},
	},
};

export function getUsers(server) {
	server.get("/users", allUsersSchema, (req, res) => {
		const users = db.prepare(`SELECT id, username, profile_image_url FROM users`).all();
		console.log(users);
		res.send(users);
	});
}
