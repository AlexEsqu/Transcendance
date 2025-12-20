// mockValidateApiKey.js
import fp from "fastify-plugin";

export default fp(async (server) => {
  server.decorate("authenticateClient", async () => {}); // no-op for tests
});
