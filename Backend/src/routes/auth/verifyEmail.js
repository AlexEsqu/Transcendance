export default function verifyEmail(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description:
				"Verifies a user's email address using a `one-time token` sent by email.\
			The user clicks a verification link received by email.\
			If the token is valid and not expired, the email is marked as verified\
			and the user is redirected to the frontend application.\
  			",
			querystring: {
				type: "object",
				required: ["token"],
				properties: {
					token: {
						type: "string",
						description: "Email verification token sent to the user by email",
						example: "a3f9c8e2b4d74e0c9f...",
					},
				},
			},
			response: {
				302: {
					description: "Email successfully verified. User is redirected to the frontend.",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
			},
		},
	};
	server.get("/verify-email", opts, async (request, reply) => {
		try {
			const { token } = request.query;
			if (!token)
				reply.status(400).send({
					error: "Bad Request",
					message: "Token is absent in query parameters",
				});
			const user = server.db.prepare(`SELECT email_verify_expires, id FROM users WHERE email_verify_token = ?`).get(token);

			if (!user) {
				return reply.status(400).send({
					error: "Bad Request",
					message: "Invalid token",
				});
			}
			if (!user.email_verify_expires || user.email_verify_expires < Date.now()) {
				return reply.status(400).send({
					error: "Bad Request",
					message: "Token is expired",
				});
			}
			server.db.prepare(`UPDATE users SET email_verify_token = NULL, email_verify_expires = NULL, email_verified = ? WHERE id = ?`).run(1, user.id);
			return reply.redirect(`${process.env.FRONTEND_DOMAIN_NAME}/connection/login?verified=true`);
		} catch (error) {
			console.error(error);
			reply.status(500).send({
				error: "Internal Server Error",
				message: error.message,
			});
		}
	});
}
