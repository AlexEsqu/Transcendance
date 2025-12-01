import db from "../../database.js";
import { server } from "../../server.js";


//TODO: GDPR => DONT FORGET TO ANONIMIZE THE USER EVERYWHERE IN DB
function deleteUser(server) {
	const opts = {
		schema: {
			tags: ["user"],
			description: "Deletes the user account and all its data. `This endpoint requires client AND user authentication.`",
			security: server.security.UserAuth,
		},
		onRequest: [server.authenticateUser],
	};
	server.delete("/me", opts, (req, reply) => {
		const { id } = req.user;
		db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
		reply.status(204).send();
	});
}

export default deleteUser;
