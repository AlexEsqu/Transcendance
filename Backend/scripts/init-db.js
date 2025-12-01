// scripts/init-db.js
import Database from "better-sqlite3";

const db = new Database("/app/data/database.db");
db.pragma("journal_mode = WAL");

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        refresh_token_hash TEXT,
        profile_image_url TEXT
    );
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        winner_id INTEGER NOT NULL,
        loser_id INTEGER NOT NULL,
        winner_score INTEGER NOT NULL,
        loser_score INTEGER NOT NULL,
        date DATETIME NOT NULL
    );
`).run();

console.log("Database initialized");
db.close();
