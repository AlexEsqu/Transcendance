import bcrypt from "bcrypt";
import { server } from "../app.js";

export function createAccessToken(id, username, db) {
	const token = server.jwt.sign(
		{
			id: id,
			username: username,
		},
		{ expiresIn: "5m" } //TODO
	);
	//SET IS ACTIVE TO TRUE
	var date = new Date();
	var sqliteDate = date.toISOString();
	db.prepare(
		`UPDATE users SET is_active = ?, last_activity = ? WHERE id = ?`
	).run("true", sqliteDate, id);
	return token;
}

export function createRefreshToken(id, username) {
	return server.jwt.sign({ id, username }, { expiresIn: "7d" });
}

export async function hashRefreshToken(token) {
	return await bcrypt.hash(token, await bcrypt.genSalt(10));
}
