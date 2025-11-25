import db from "/app/src/database.js";

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
		handler: function (req, res) {
			try {
				const { username, password } = req.body;
				const addUser = db.prepare(`INSERT INTO users(username,password_hash) VALUES (?, ?)`);
				addUser.run(username, password);

				res.send({ message: "User received", username });
			} catch (err) {
				handleSQLiteError(err, reply);
			}
		},
	};

	server.post("/users", opts);
}

export default postUser;
