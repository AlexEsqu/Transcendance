import { getUserbyId, formatUserObject } from "../../../utils/utils.js";

export default function getFriends(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.UserAuth,
			description:
				"Returns the complete list of friends of the authenticated user.\
				Returns basic profile information for each friend.\
				`This endpoint requires client authentication AND user authentication.`",
			response: {
				200: {
					type: "array",
					items: { $ref: "publicUserObject#" },
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
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
		onRequest: [server.authenticateClient, server.authenticateUser],
	};
	server.get("/me/friends", opts, async (req, reply) => {
		try {
			const { id } = req.user;
		
			const friends_id = server.db.prepare(`SELECT friend_id FROM friends WHERE user_id = ?`).all(id);
			let friends = [];
			for (const row of friends_id) {
				const friend = await getUserbyId(row.friend_id, server.db);
				if (friend) {
					formatUserObject(friend);
					friends.push(friend);
				}
			}
			console.log(friends);

			reply.send(friends);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
