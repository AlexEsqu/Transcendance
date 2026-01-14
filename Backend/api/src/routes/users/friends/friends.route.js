import { getUserbyId, formatUserObject } from "../../../utils/utils.js";
import { addFriendSchema, deleteFriendSchema, getFriendsSchema } from "../../../schemas/friends.schema.js";
export function getFriends(server) {
	const opts = {
		schema: getFriendsSchema,
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

export function addFriend(server) {
	const opts = {
		schema: addFriendSchema,
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
