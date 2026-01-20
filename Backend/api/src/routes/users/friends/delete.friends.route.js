import { getUserbyId } from "../../../utils/utils.js";
import { deleteFriendSchema } from "../../../schemas/delete.friends.schema.js";

export  function deleteFriend(server) {
	const opts = {
		schema: deleteFriendSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
		preHandler: async (req, reply) => {
			// Verify the id passed as parameter
			const { id } = req.body;
			const user = await getUserbyId(id, server.db);
			if (!user) {
				return reply.status(404).send({ error: "Not Found", message: "Friend user id not found" });
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
				return reply.status(400).send({ error: "Bad request", message: "You cannot delete yourself" });
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
