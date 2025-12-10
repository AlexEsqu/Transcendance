import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";

export default function signup(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description: "Creates a new user account using a username and password. Does not automatically log in the user.",
			body: { $ref: "SignupBody" },
			response: {
				201: {
					description: "Signed up user successfully",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				409: {
					description: "Conflict: Username already exists",
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
	};
	
	server.post("/signup", opts, async (request, reply) => {
		const { username, password } = request.body;
		try {
			const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
			const addUser = server.db.prepare(`INSERT INTO users(username, password_hash) VALUES (?, ?)`);
			addUser.run(username, hash);
			reply.status(201).send({ success: true, message: "Signed up successfully" });
		} catch (err) {
			server.log.error(err);
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				reply.status(409).send({ error: "Username is already taken" });
			}
			handleSQLiteError(err, reply);
		}
	});
}
