import db from "/app/src/database.js";
import fs from "fs";

export default function patchUserAvatar(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Modifies the avatar of the user. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
			consumes: ["multipart/form-data"],
			body: {
				type: "object",
				required: ["avatar"],
				properties: {
					avatar: { isFile: true },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
					},
				},
			},
		},
		onRequest: [server.authenticateUser],
	};
	server.patch("/me/avatar", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			//retrive old avatar path
			const { avatar_path } = db.prepare(`SELECT avatar_path FROM users WHERE id = ?`).get(id);
			const old_avatar_path = avatar_path;

			const data = req.body.avatar;

			//get the full upload path
			const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}${data.filename}`;

			const buffer = await data.toBuffer();
			fs.writeFileSync(uploadPath, buffer);

			db.prepare(`UPDATE users SET avatar_path = ? WHERE id = ?`).run(uploadPath, id);

			if (old_avatar_path) {
				fs.unlink(old_avatar_path, () => {
					console.log(old_avatar_path + " was deleted");
				});
			}
			reply.status(200).send({ success: true });
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
