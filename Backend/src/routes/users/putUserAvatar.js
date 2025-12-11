import fs from "fs";

export default function putUserAvatar(server) {
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
					description: "Updated avatar successfully",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				401: {
					description: "Unauthorized: Invalid credentials",
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
	};
	server.put("/me/avatar", opts, async (req, reply) => {
		try {
			const id = req.user.id;

			//retrive old avatar path
			const { avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);
			const old_avatar = avatar;

			const data = req.body.avatar;
			
			//get the full upload path
			const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}${data.filename}`;

			const buffer = await data.toBuffer();
			fs.writeFileSync(uploadPath, buffer);

			server.db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(uploadPath, id);

			if (old_avatar) {
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
