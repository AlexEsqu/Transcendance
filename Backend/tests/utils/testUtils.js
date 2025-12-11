export async function addUser(
	server,
	{
		username = "test_user",
		passwordHash = "fakehash",
		avatar = null,
		refreshTokenHash = null,
	} = {}
) {
	const stmt = server.db.prepare(`
    INSERT INTO users (username, password_hash, avatar, refresh_token_hash)
    VALUES (?, ?, ?, ?)
  `);
	const info = stmt.run(username, passwordHash, avatar, refreshTokenHash);

	return {
		id: info.lastInsertRowid,
		username,
		avatar,
		refreshTokenHash,
	};
}

export async function addMatch(
  server,
  {
    winner_id = 0,
    loser_id = 0,
    winner_score = 0,
    loser_score = 0,
    date = new Date().toISOString(),
  } = {}
) {
  const stmnt = server.db.prepare(
    `INSERT INTO matches (winner_id, loser_id, winner_score, loser_score, date)
     VALUES (?, ?, ?, ?, ?)`
  );

  const info = stmnt.run(winner_id, loser_id, winner_score, loser_score, date);

  return {
    id: info.lastInsertRowid,
    winner_id,
    loser_id,
    winner_score,
    loser_score,
    date,
  };
}
