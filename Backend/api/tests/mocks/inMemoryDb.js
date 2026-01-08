import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { addUser, addMatch } from "../utils/testUtils";
import { users, matches } from "./mockObjects";
import { initDB } from "../../scripts/init-db";

export default fp(async (server) => {
	const db = new Database(":memory:");
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON"); // optional but recommended

	// --- TABLES ----------------------------------------------------
	initDB(db);
	// Make DB available to tests
	server.decorate("db", db);

	// --- INSERT TEST USERS ------------------------------------------

	for (let i = 0; i < users.length; i++) {
		users[i] = await addUser(server, users[i]);
	}
	// --- INSERT TEST MATCHES ------------------------------------------

	for (let i = 0; i < matches.length; i++) {
		matches[i] = await addMatch(server, matches[i]);
	}
});
