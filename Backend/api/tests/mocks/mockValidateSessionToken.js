// mockValidateSessionToken.js
import fp from "fastify-plugin";

export default fp(async (server) => {
  server.decorate("authenticateRefreshToken", async () => {}); // no-op
});