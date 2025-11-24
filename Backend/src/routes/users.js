import db from "../database.js";

function getUsers(app, options) {
	app.get("/users", (request, reply) => {
		const users = db.prepare("SELECT * FROM users").all();
		console.log("hello");
		console.log(users);
		return users;
	});
}

export default getUsers;
