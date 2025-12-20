// plugins/db.js
import fp from "fastify-plugin";
import Database from "better-sqlite3";

export default fp(async function (server) {
  // create new connection
  const db = new Database("/app/data/database.db", {
    verbose: console.log,
  });

  // decorate Fastify instance so all handlers can access it
  server.decorate("db", db);

  // optionally close DB on server close
  server.addHook("onClose", async () => {
    db.close();
    console.log("Database connection closed");
  });
});
