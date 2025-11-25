// import db from "../../database.js";

function postUser(server) {
	server.post("/user", function (request, reply) {
		console.log(request.body);
		const {username, password} = request.body;
	});
}

export default postUser;
