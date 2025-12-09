import Database from "better-sqlite3";

//create new connection to Database
const db = new Database("/app/data/database.db", {
	verbose: console.log,
});

export default db;
