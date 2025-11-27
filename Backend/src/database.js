import Database from 'better-sqlite3'

//create new connection to Database
const db = new Database('/app/data/database.db', {
	verbose: console.log
})
// Enable WAL mode for performance
db.pragma('journal_mode = WAL');
//creates the USER table if it does not exist

const tableExists = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
  .get();

const createTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
		refresh_token_hash TEXT,
        profile_image_url TEXT
    );
`);

if (!tableExists) {
  createTable.run();
}
export default db;