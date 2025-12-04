import db from "/app/src/database.js";
import { pipeline } from "node:stream/promises";
import { Readable } from "stream";
import fs from "fs";

export default function patchUserInfo(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Modifies the data of the user. `This endpoint requires client AND user authentication.`",
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
	server.patch("/me", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			const { avatar_url } = db.prepare(`SELECT avatar_url FROM users WHERE id = ?`).get(id);
			const old_avatar_url = avatar_url;
			const data = req.body.avatar;

			const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}${data.filename}`;
			const buffer = await data.toBuffer();
			fs.writeFileSync(uploadPath, buffer);

			db.prepare(`UPDATE users SET avatar_url = ? WHERE id = ?`).run(uploadPath, id);

			if (old_avatar_url) {
				fs.unlink(old_avatar_url, (err) => {
					if (err) throw err;
					console.log(old_avatar_url + " was deleted");
				});
			}
			reply.status(200).send({ success: true });
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
