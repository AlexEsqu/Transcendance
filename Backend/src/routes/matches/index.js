
import getMatches from "./getMatches.js";
import getUserMatches from "./getUserMatches.js";
import postMatches from "./postMatch.js";


export default async function matchesRoutes(server) {
  server.register(postMatches);
  server.register(getMatches);
  server.register(getUserMatches, { prefix: "users" });
}