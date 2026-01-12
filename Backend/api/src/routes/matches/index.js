import { getMatches, getUserMatches, postMatches } from "./matches.route.js";

export default async function matchesRoutes(server) 
{
	server.register(postMatches, { prefix: "api" });
	server.register(getMatches, { prefix: "api" });
	server.register(getUserMatches, { prefix: "api/users" });
}
