import fs from "fs";
import { deleteUserSchema } from "../schemas/delete-me.schema.js";
//TODO: GDPR => DONT FORGET TO ANONIMIZE THE USER EVERYWHERE IN DB
function deleteUser(server) {
	const opts = {
		schema: {
			$ref: deleteUserSchema,
		},
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.delete("/me", opts, (req, reply) => {
		try {
			const { id } = req.user;
			//delete the users avatar from db
			const {avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);
			if (avatar) {
				fs.unlink(avatar, () => {
					console.log(avatar + " was deleted");
				});
			}
			server.db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
			//Clear the refresh token from cookies
			reply.clearCookie("refreshToken", {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				path: "/users/auth",
			});
			return reply.status(204).send();
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default deleteUser;
