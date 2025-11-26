import db from "/app/src/database.js";
import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";

function userSignup(server) {
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
			response: {
				200: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
					required: ["token"],
				},
			},
		},
		handler: async (request, reply) => {
			const { username, password } = request.body;
			try {
				let saltRounds = 10;
				const hash = await bcrypt.hash(password, saltRounds);
				const addUser = db.prepare(`INSERT INTO users(username, password_hash) VALUES (?, ?)`);
				addUser.run(username, hash);
			} catch (dbErr) {
				handleSQLiteError(dbErr, reply);
			}
		},
	};
	server.post("/users/signup", opts);
}
export default userSignup;
