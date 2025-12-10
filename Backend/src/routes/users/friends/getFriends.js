import db from "../../../database.js";
import { getUserbyId, modifyUserAvatarKeyName } from "../../../utils/utils.js";

export default function getFriends(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.AppAuth,
			description:
				"Returns the complete list of friends for the user specified by the id path parameter.\
				Returns basic profile information for each friend.`This endpoint requires client authentication.`",
			params: {
				type: "object",
				properties: {
					id: { type: "integer"},
				},
				required: ["id"],
			},
			response: {
				200: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "integer" },
							username: { type: "string" },
							avatar_url: { type: "string" },
						},
					},
				},
			},
		},
		onRequest: [server.authenticateClient],
	};
	server.get("/:id/friends", opts, async (req, reply) => {
		try {
			const { id } = req.params;
			const user = await getUserbyId(id, db);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}
			const friends_id = server.db.prepare(`SELECT friend_id FROM friends WHERE user_id = ?`).all(id);
			let friends = [];
			for (const row of friends_id) {
				const friend = await getUserbyId(row.friend_id, db);
				if (friend) {
					modifyUserAvatarKeyName(friend);
					friends.push(friend);
				}
			}
			console.log(friends);

			reply.send(friends);
		} catch (err) {
			server.log.error(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
