import db from "../../database.js";

function getUser(server) {
	const opts = {
		schema: {
			params: {
				type: "object",
				properties: {
					user_id: { type: "integer" },
				},
				required: ["user_id"],
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
			console.log("params:", request.params);
			console.log("hello")
			const user = db.prepare("SELECT user_id, username, is_connected FROM users WHERE user_id = ?").get(user_id);
			if (!user) {
				reply.code(404).send({ error: "User not found" });
			} else {
				console.log(user);
				reply.send(user);
			}
		},
	};
	server.get("/users/:user_id", opts);
}
export default getUser;
