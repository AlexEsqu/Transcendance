import db from "../../database.js";

function getUsers(server) {
	const opts = {
		schema: {
			response: {
				200: {
					type: "array",
					items: {
						properties: {
							user_id: { type: "integer" },
							username: { type: "string" },
							is_connected: { type: "boolean" },
						},
					},
				},
			},
		},
		handler: function (request, reply) {
			const users = db.prepare("SELECT user_id, username, is_connected FROM users").all();
			console.log(users);
			reply.send(users);
		},
	};
	server.get("/users", opts);
}

export default getUsers;
