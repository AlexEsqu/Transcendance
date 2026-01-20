import { logoutSchema } from "../../schemas/post.logout.schema.js";

export default function logout(server) {
	const opts = {
		schema: logoutSchema,
		onRequest: [server.authenticateClient, server.authenticateRefreshToken],
	};
	server.post("/logout", opts, async (req, reply) => {
		try {
			//Clear the refresh token from db
			const { id, username } = req.user;
			console.log("Logging out user with id =", id);
			server.db.prepare(`UPDATE users SET refresh_token_hash = null WHERE id = ?`).run(id);

			//Clear the refresh token from cookies
			reply.clearCookie("refresh_token", {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});

			// Send confirmation
			return reply.status(200).send({
				success: true,
				message: "Logged out " + username + " successfully",
			});
		} catch (err) {
			console.log(err);
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}
