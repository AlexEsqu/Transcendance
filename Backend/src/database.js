import Database from 'better-sqlite3'

//create new connection to Database
const db = new Database('/app/src/data/database.db', {
	verbose: console.log
})
// Enable WAL mode for performance
db.pragma('journal_mode = WAL');
//creates the USER table if it does not exist

export default db;