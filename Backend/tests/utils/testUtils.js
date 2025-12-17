import bcrypt from "bcrypt";

export async function addUser(server, user) {
	// allow tests to provide passwordHash OR password
	const finalHash = await bcrypt.hash(user.password, 10);

	const stmt = server.db.prepare(`
    INSERT INTO users (username, password_hash, avatar, refresh_token_hash, email, email_verified)
    VALUES (?, ?, ?, ?, ?,?)
  `);

	stmt.run(user.username, finalHash, user.avatar, user.refreshTokenHash, user.email, 1);

	return user;
}

export async function addMatch(server, { winner_id, loser_id, winner_score, loser_score, date }) {
	const stmt = server.db.prepare(`
    INSERT INTO matches (winner_id, loser_id, winner_score, loser_score, date)
    VALUES (?, ?, ?, ?, ?)
  `);

	const info = stmt.run(winner_id, loser_id, winner_score, loser_score, date);

	return {
		id: info.lastInsertRowid,
		winner_id,
		loser_id,
		winner_score,
		loser_score,
		date,
	};
}
