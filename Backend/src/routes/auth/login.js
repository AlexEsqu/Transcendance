import db from "/app/src/database.js";
import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";
import { server } from "../../server.js";
import { createAccessToken, createRefreshToken } from "../../services/authServices.js";

const opts = {
	schema: {
		tags: ["auth"],
		body: {
			type: "object",
			properties: {
				username: { type: "string" },
				password: { type: "string" },
			},
			required: ["username", "password"],
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				accessToken: { type: "string" },
			},
			required: ["accessToken"],
		},
	},
};

function login(server) {
	server.post("/auth/login", opts, async (req, reply) => {
		try {
			const { username, password } = req.body;

			//looks for the user in the db if it exists
			const user = await db.prepare(`SELECT password_hash, id FROM users WHERE username = ? `).get(username);
			if (!user) {
				return reply.status(401).send({ error: "Invalid credentials" });
			}
			//checks if the password matches
			const match = await bcrypt.compare(password, user.password_hash);

			if (!match) {
				return reply.status(401).send({ error: "Invalid credentials" });
			} else {
				const accessToken = createAccessToken(user.id, username);
				createRefreshToken(user.id, username)

				reply.send({ accessToken });
				// const update = db.prepare(`UPDATE users SET is_connected = 1 WHERE id = ?`).get(user.user_id);
			}
		} catch (err) {
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export default login;
