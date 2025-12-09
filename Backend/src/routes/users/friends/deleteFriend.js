import db from "../../../database.js";
import { getUserbyId } from "../../../utils/utils.js";

export default function deleteFriend(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description:
				"Deletes a friend from the authenticated user's friend list using the id passed in the body.\
						`This endpoint requires client authentication AND user authentication.`",

			security: server.security.UserAuth,
			body: {
				type: "object",
				required: ["friend_id"],
				properties: {
					friend_id: { type: "integer"},
				},
			},
			response: {
				204: { type: "null" },
				404: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
				400: {
					type: "object",
					properties: {
						error: { type: "string" },
					},
				},
			},
		},
		onRequest: [server.authenticateUser],
		preHandler: async (req, reply) => {
			// Verify the id passed as parameter
			const { friend_id } = req.body;
			const user = await getUserbyId(friend_id, db);
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
			const friend = db.prepare(`SELECT * FROM friends WHERE user_id = ? AND friend_id = ?`).get(userId, friendId);
			if (!friend)
				return reply.status(400).send({
					error: `User ${req.user.username} is not friend with ${req.friend.username}`,
				});

			db.prepare(`DELETE FROM friends WHERE user_id = ? AND friend_id = ?`).run(userId, friendId);
			return reply.status(204).send();
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
