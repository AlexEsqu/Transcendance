import db from "../../database.js";
import fs from "fs";

//TODO: GDPR => DONT FORGET TO ANONIMIZE THE USER EVERYWHERE IN DB
function deleteUser(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the user account and all its data. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
			response: {
				204: { type: "null" },
			},
		},
		onRequest: [server.authenticateUser, server.authenticateClient],
	};
	server.delete("/me", opts, (req, reply) => {
		const { id } = req.user;
		//delete the users avatar from db
		const { avatar_path } = db.prepare(`SELECT avatar_path FROM users WHERE id = ?`).get(id);
		if (avatar_path) {
			fs.unlink(avatar_path, () => {
				console.log(avatar_path + " was deleted");
			});
		}
		db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
		reply.status(204).send();
	});
}

export default deleteUser;
