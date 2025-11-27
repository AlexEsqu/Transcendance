import db from "/app/src/database.js";
import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";

function signup(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			body: {
				type: "object",
				required: ["username", "password"],
				properties: {
					username: { type: "string", minLength: 3, maxLength: 20 },
					password: { type: "string", minLength: 8 },
				},
			},
		},
		handler: async (request, reply) => {
			const { username, password } = request.body;
			try {
				const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
				const addUser = db.prepare(`INSERT INTO users(username, password_hash) VALUES (?, ?)`);
				addUser.run(username, hash);
			} catch (dbErr) {
				console.log(dbErr)
				handleSQLiteError(dbErr, reply);
			}
			reply.status(200).send({ success: true, message: "Signed up successfully" })
		},
	};
	server.post("/users/signup", opts);
}
export default signup;
