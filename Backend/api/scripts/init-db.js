// scripts/init-db.js
import Database from "better-sqlite3";

export const db = new Database("/app/data/database.db");
db.pragma("journal_mode = WAL");

export async function initDB(db) {
	db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
		last_activity DATETIME,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT DEFAULT NULL,
		email TEXT NOT NULL UNIQUE,
		avatar TEXT,
        refresh_token_hash TEXT,
		email_verified INTEGER DEFAULT 0,
		email_verify_token TEXT,
		email_verify_expires INTEGER,
		is_2fa_enabled INTEGER DEFAULT 0,
		code_hash_2fa TEXT,
		code_expires_2fa INTEGER,
		token_2fa TEXT,
		oauth_provider TEXT DEFAULT NULL);
`).run();

	db.prepare(
		`
    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        winner_id INTEGER NOT NULL,
        loser_id INTEGER NOT NULL,
        winner_score INTEGER NOT NULL,
        loser_score INTEGER NOT NULL,
        date DATETIME NOT NULL
    );
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
    );
`
	).run();
}

initDB(db);
console.log("Database initialized");
db.close();
