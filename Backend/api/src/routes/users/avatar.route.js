import fs from "fs";
import { putUserAvatarSchema, deleteUserAvatarSchema } from "../../schemas/avatar.schema.js";
export function putUserAvatar(server) {
	const opts = {
		$ref: putUserAvatarSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.put("/me/avatar", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			//retrive old avatar path
			const { avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);
			const old_avatar = avatar;

			const data = req.body.avatar;

			//get the full upload path
			const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}/user_${id}_${data.filename}`;
			console.log(uploadPath);
			const buffer = await data.toBuffer();
			fs.writeFileSync(uploadPath, buffer);

			server.db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(uploadPath, id);

			if (old_avatar && old_avatar !== uploadPath) {
				fs.unlink(old_avatar, () => {
					console.log(old_avatar + " was deleted");
				});
			}
			reply.status(200).send({ success: true, message: "Updated avatar successfully" });
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}

export function deleteUserAvatar(server) {
	const opts = {
		$ref: deleteUserAvatarSchema,
		onRequest: [server.authenticateUser, server.authenticateClient],
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
