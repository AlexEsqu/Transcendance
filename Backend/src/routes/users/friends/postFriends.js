import db from "../../../database.js";
import { getUserbyId } from "../../../utils/utils.js";

export default function addFriends(server) {
	const opts = {
		schema: {
			tags: ["friends"],
			description: "Lets the user add a friend using the friend's id passed as parameter. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
			body: {
				type: "object",
				required: ["friend_id"],
				properties: {
					friend_id: { type: "integer", minimum: 1 },
				},
			},
		},
		onRequest: [server.authenticateUser],
		preHandler: async (req, reply) => {
			// Verify the id passed as parameter
			const { friend_id } = req.body;
			const user = await getUserbyId(friend_id, db);
			if (!user) {
				return reply.status(404).send({ error: "Friend id not found" });
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
				return reply.status(400).send({ error: "User id and friend_id cannot be the same" });
			}
			db.prepare(`INSERT INTO friends(user_id, friend_id) VALUES (?,?)`).run(userId, friendId);
			reply.status(200).send({ success: true, message: `Sucessfully added ${req.friend.username} to ${req.user.username}'s friend list` });
		} catch (err) {
			if (err.code == "SQLITE_CONSTRAINT_PRIMARYKEY") {
				return reply.status(400).send({ error: `User ${req.user.username} is already friend with ${req.friend.username}` });
			}
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
