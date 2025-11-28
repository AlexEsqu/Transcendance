import db from "/app/src/database.js";
import bcrypt from "bcrypt";

function logout(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description: "Will log out the user",
			security: server.security.UserAndSession,
		},
		onRequest: [server.authenticateUser],
	};
	server.post("/auth/logout", opts, async (req, reply) => {
		//Clear the refresh token from db
		const { id, username } = req.user;
		console.log(id);
		db.prepare(`UPDATE users SET refresh_token_hash = NULL WHERE id = ?`).run(id);

		//Clear the refresh token from cookies
		reply.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
		});

		// Send confirmation
		return reply.send({ success: true, message: "Logged out " + username + " successfully" });
	});
}

export default logout;
