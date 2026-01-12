import bcrypt from "bcrypt";
import { getUserbyId } from "../../utils/utils.js";


export default function postUserPassword(server) {
	const opts = {
		schema: {
			tags: ["user"],
			security: server.security.UserAuth,
			description: "Sets the password of an user that doesnt already have a password (oAuth signup). `This endpoint requires client AND user authentication.`",
			body: {
				type: "object",
				required: ["password"],
				properties: {
					password: { type: "string", minLength: 8 },
				},
				additionalProperties: false,
			},
			response: {
				200: {
					description: "Uploaded password successfully",
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
				403: {
					description: "Forbidden: User already has a password",
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
	server.post("/me/password", opts, async (req, reply) => {
		try {
			const { password } = req.body;
			const { id } = req.user;
			const user = await getUserbyId(id, server.db);
			console.log(user)
			if (user.oauth_provider && !user.password_hash )
			{
				//hash password and update db
				const password_hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
				server.db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(password_hash, id);
				reply.status(200).send({ success: true, message: "Set password successfully" });
			}
			reply.status(403).send ({error: "Forbidden", message: "You already have a password, please use the \"Change Password\" button"})
				
			
		} catch (err) {
			console.log(err);
		}
	});
}
