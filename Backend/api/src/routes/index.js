import authRoutes from "./auth/index.js";
import matchesRoutes from "./matches/index.js";
import userRoutes from "./users/index.js";

export default async function Routes(server) {
	server.register(matchesRoutes);
	server.register(userRoutes);
	server.register(authRoutes);
}