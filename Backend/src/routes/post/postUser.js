import db from "/app/src/database.js";
import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";

function postUser(server) {
	const opts = {
		schema: {
			body: {
				type: "object",
				required: ["username", "password"],
				properties: {
					username: { type: "string", minLength: 3, maxLength: 20 },
					password: { type: "string", minLength: 8 },
				},
			},
		},
		handler: (request, reply) => {
			const { username, password } = request.body;
			let saltRounds = 10;
			// Hash password using callback style
			bcrypt.hash(password, saltRounds, (err, hash) => {
				if (err) {
					console.error("Bcrypt error:", err.message);
					return reply.status(500).send({ error: "Password hashing failed" });
				}
				try {
					const addUser = db.prepare(`INSERT INTO users(username, password_hash) VALUES (?, ?)`);
					addUser.run(username, hash);
					reply.send({ message: "User created", username });
				} catch (dbErr) {
					handleSQLiteError(dbErr, reply);
				}
			});
		},
	};
	server.post("/users", opts);
}
export default postUser;
