import db from "/app/src/database.js";

function logout(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description: "Logs the user out by invalidating the refresh token stored in the `HttpOnly refreshToken cookie`. After logout, the user must reauthenticate with their username and password to obtain new tokens. This endpoint requires client authentification AND user authentification AND the refresh cookie stored in the HttpOnly refreshToken cookie",
			security: server.security.UserAndSession,
		},
		onRequest: [server.authenticateUser, server.authenticateClient, server.authenticateRefreshToken],
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
