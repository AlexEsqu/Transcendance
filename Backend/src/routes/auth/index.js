import login from "./login.js";
import logout from "./logout.js";
import refresh from "./refresh.js";

export default async function authRoutes(server) {
	server.register(login, { prefix: "users" });
	server.register(refresh, { prefix: "users" });
	server.register(logout, { prefix: "users" });
}
