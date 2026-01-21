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
		pending_email TEXT DEFAULT NULL,
		avatar TEXT,
        refresh_token_hash TEXT,
		refresh_token_version INTEGER DEFAULT 0,
		email_verified INTEGER DEFAULT 0,
		email_verify_token TEXT,
		email_verify_expires INTEGER,
		email_change_token TEXT,
		email_change_expires INTEGER,
		is_2fa_enabled INTEGER DEFAULT 0,
		code_hash_2fa TEXT,
		code_expires_2fa INTEGER,
		code_attempts_2fa INTEGER DEFAULT 0,
		oauth_provider TEXT DEFAULT NULL,
		reset_password_token TEXT,
		reset_password_token_expires INTEGER);
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
