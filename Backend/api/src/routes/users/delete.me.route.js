import fs from "fs";
import { deleteMeSchema } from "../../schemas/delete.me.schema.js";
//TODO: GDPR => DONT FORGET TO ANONIMIZE THE USER EVERYWHERE IN DB
function deleteMe(server) {
	const opts = {
		schema: deleteMeSchema,
		onRequest: [server.authenticateUser],
	};
	server.delete("/me", opts, (req, reply) => {
		try {
			const { id } = req.user;
			//delete the users avatar from db
			const { avatar } = server.db.prepare(`SELECT avatar FROM users WHERE id = ?`).get(id);
			if (avatar) {
				fs.unlink(avatar, () => {
					console.log(avatar + " was deleted");
				});
			}
			server.db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
			//Clear the refresh token from cookies
			reply.clearCookie("refresh_token", {
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

export default deleteMe;
