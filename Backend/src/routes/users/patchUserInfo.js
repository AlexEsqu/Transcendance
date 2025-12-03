import db from "/app/src/database.js";
import { pipeline } from "node:stream/promises";
import fs from "fs"

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
			const data = req.body.avatar

			const uploadPath = `uploads/avatar/${data.filename}`;
			await pipeline(data.file, fs.createWriteStream(uploadPath));
			const id = req.user.id;

			db.prepare(`UPDATE users SET profile_image_url = ? WHERE id = ?`).run(uploadPath, id);
			reply.status(200).send({ success: true });
		} catch (err) {
			console.log(err);
			reply.status(500).send("internal server error");
		}
	});
}
