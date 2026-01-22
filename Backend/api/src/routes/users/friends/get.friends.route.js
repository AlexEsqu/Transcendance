import { getUserbyId, formatUserObject } from "../../../utils/utils.js";
import { getFriendsSchema } from "../../../schemas/get.friends.schema.js";

export function getFriends(server) {
	const opts = {
		schema: getFriendsSchema,
		onRequest: [server.authenticateUser],
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
