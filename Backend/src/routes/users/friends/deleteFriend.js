import { getUserbyId } from "../../../utils/utils.js";

export default function deleteFriend(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description:
				"Deletes a friend from the authenticated user's friend list using the id passed in the body.\
						`This endpoint requires client authentication AND user authentication.`",
			security: server.security.UserAuth,
			body: { $ref: "userIdObject#" },
			response: {
				204: { description: "Successfully deleted friend", type: "null" },
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
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
		onRequest: [server.authenticateUser, server.authenticateClient],
		preHandler: async (req, reply) => {
			// Verify the id passed as parameter
			const { id } = req.body;
			const user = await getUserbyId(id, server.db);
			if (!user) {
				return reply.status(404).send({ error: "Friend not found" });
			}
			console.log(user);

			req.friend = user;
		},
	};
	server.delete("/me/friends", opts, (req, reply) => {
		try {
			const userId = req.user.id;
			const friendId = req.friend.id;

			if (userId == friendId) {
				return reply.status(400).send({ error: "User id and friend_id cannot be the same" });
			}

			//check if they are friends before trying to delete
			const friend = server.db.prepare(`SELECT * FROM friends WHERE user_id = ? AND friend_id = ?`).get(userId, friendId);

			if (!friend)
				return reply.status(400).send({
					error: `User ${req.user.username} is not friend with ${req.friend.username}`,
				});

			server.db.prepare(`DELETE FROM friends WHERE user_id = ? AND friend_id = ?`).run(userId, friendId);
			return reply.status(204).send();
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
