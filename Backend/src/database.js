import Database from 'better-qlite3'

const db = new Database('database.db', {
	verbose: console.log
})