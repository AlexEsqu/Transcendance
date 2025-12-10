import db from "../../../database.js";
import { getUserbyId } from "../../../utils/utils.js";

export default function addFriend(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description:
				"Adds a new friend to the authenticated user's friend list.\
						The friend_id provided in the request body is validated before the friendship record is created.\
						`This endpoint requires client authentication AND user authentication.`",

			security: server.security.UserAuth,
			body: { $ref: "userIdObject#" },
			response: {
				201: { $ref: "SuccessMessageResponse#" },
				400: {
					description: "Bad Request: Invalid input or missing fields",
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
			server.db.prepare(`INSERT INTO friends(user_id, friend_id) VALUES (?,?)`).run(userId, friendId);
			reply.status(201).send({ success: true, message: `Sucessfully added ${req.friend.username} to ${req.user.username}'s friend list` });
		} catch (err) {
			if (err.code == "SQLITE_CONSTRAINT_PRIMARYKEY") {
				return reply.status(400).send({ error: `User ${req.user.username} is already friend with ${req.friend.username}` });
			}
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
