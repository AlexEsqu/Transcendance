
import getMatches from "./getMatches.js";
import getUserMatches from "./getUserMatches.js";
import postMatches from "./postMatch.js";


export default async function matchesRoutes(server) {
  server.register(postMatches, { prefix: "api" });
  server.register(getMatches, { prefix: "api" });
  server.register(getUserMatches, { prefix: "api/users" });
}