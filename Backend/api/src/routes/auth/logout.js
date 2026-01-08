export default function logout(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description:
				"Logs the user out by invalidating the refresh token stored in the \
				`HttpOnly refreshToken cookie`. After logout, the user must reauthenticate with their\
				 username and password to obtain new tokens. This endpoint requires client authentification \
				 AND user authentification AND the refresh cookie stored in the HttpOnly refreshToken cookie",
			security: server.security.SessionAuth,
			response: {
				200: {
					description: "Success: User successfully logged out",
					$ref: "SuccessMessageResponse#",
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
		onRequest: [server.authenticateClient, server.authenticateRefreshToken],
	};
	server.post("/logout", opts, async (req, reply) => {
		try {
			//Clear the refresh token from db
			const { id, username } = req.user;
			console.log("Logging out user with id =", id);
			server.db.prepare(`UPDATE users SET refresh_token_hash = null WHERE id = ?`).run(id);

			//Clear the refresh token from cookies
			reply.clearCookie("refreshToken",{
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
