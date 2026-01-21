import { getUserbyId } from "../../../utils/utils.js";
import { postFriendSchema } from "../../../schemas/post.friends.schema.js";

export function postFriend(server) {
	const opts = {
		schema: postFriendSchema,
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
	server.post("/me/friends", opts, (req, reply) => {
		try {
			const userId = req.user.id;
			const friendId = req.friend.id;

			if (userId == friendId) {
				return reply.status(400).send({ error: "Bad Request", message: "You cannot add yourself as a friend" });
			}
			server.db.prepare(`INSERT INTO friends(user_id, friend_id) VALUES (?,?)`).run(userId, friendId);
			reply.status(201).send({
				success: true,
				message: `Sucessfully added ${req.friend.username} to ${req.user.username}'s friend list`,
			});
		} catch (err) {
			if (err.code == "SQLITE_CONSTRAINT_PRIMARYKEY") {
				return reply.status(409).send({ error: "Conflict", message: `User ${req.user.username} is already friend with ${req.friend.username}` });
			}
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
