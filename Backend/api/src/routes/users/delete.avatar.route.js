import fs from "fs";
import { deleteUserAvatarSchema } from "../../schemas/delete.avatar.schema.js";

export function deleteUserAvatar(server) {
	const opts = {
		schema: deleteUserAvatarSchema,
		onRequest: [server.authenticateUser],
	};
	server.delete("/me/avatar", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			//retrive avatar path
			const { avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);

			if (avatar) {
				server.db.prepare(`UPDATE users SET avatar = NULL WHERE id = ?`).run(id);

				fs.unlink(avatar, () => {
					console.log(avatar + " was deleted");
				});
			}
			reply.status(204).send();
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
