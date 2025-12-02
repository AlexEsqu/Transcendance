import Database from "better-sqlite3";

//create new connection to Database
const db = new Database("/app/data/database.db", {
	verbose: console.log,
});
// Enable WAL mode for performance
db.pragma("journal_mode = WAL");

export default db;
