import db from "../../database.js";

function getUsers(server) {
	const opts = {
		schema: {
			params: {
				type: "object",
				properties: {
					user_id: { type: "integer" }
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						user_id: { type: "integer" },
						username: { type: "string" },
						is_connected: { type: "boolean" },
					},
				},
			},
		},
		handler: function (request, reply) {
			const { user_id } = request.params;
			if (user_id) {
				console.log("params:", request.params);
				const user = db.prepare("SELECT user_id, username, is_connected FROM users WHERE user_id = ?").get(user_id);
				if (!user) {
					reply.code(404).send({ error: "User not found" });
				} else {
					console.log(user);
					reply.send(user);
				}
			} else {
				const users = db.prepare("SELECT user_id, username, is_connected FROM users").all();
				console.log(users);
				reply.send(users);
			}
		},
	};
	server.get("/users/:user_id?", opts);
}
export default getUsers;
