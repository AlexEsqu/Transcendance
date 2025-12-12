import fp from "fastify-plugin";
import Database from "better-sqlite3";
import { addUser, addMatch } from "../utils/testUtils";
import { users, matches } from "./mockObjects";

export default fp(async (server) => {
	const db = new Database(":memory:");
	db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON"); // optional but recommended

	// --- TABLES ----------------------------------------------------

	db.prepare(
		`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_activity DATETIME,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      refresh_token_hash TEXT,
      avatar TEXT
    )
  `
	).run();

	db.prepare(
		`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      winner_id INTEGER NOT NULL,
      loser_id INTEGER NOT NULL,
      winner_score INTEGER NOT NULL,
      loser_score INTEGER NOT NULL,
      date DATETIME NOT NULL
    )
  `
	).run();

	db.prepare(
		`
    CREATE TABLE IF NOT EXISTS friends (
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
	).run();

	// Make DB available to tests
	server.decorate("db", db);

	// --- INSERT TEST USERS ------------------------------------------

	for (let i = 0; i < users.length; i++) {
		users[i] = await addUser(server, {
			username: users[i].username,
			password: users[i].password,
			avatar: users[i].avatar,
			refreshTokenHash: null,
			is_active: users[i].is_active,
		});
	}
// --- INSERT TEST MATCHES ------------------------------------------

for (let i = 0; i < matches.length; i++) {
  matches[i] = await addMatch(server, matches[i]);
}
	
});
