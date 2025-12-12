import bcrypt from "bcrypt"; 

export async function addUser(
  server,
  {
    username,
    password,
    avatar = null,
    refreshTokenHash = null,
	is_active,
  }
) {
  // allow tests to provide passwordHash OR password
  const finalHash = await bcrypt.hash(password, 10)

  const stmt = server.db.prepare(`
    INSERT INTO users (username, password_hash, avatar, refresh_token_hash)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(username, finalHash, avatar, refreshTokenHash);

  return {
    id: info.lastInsertRowid,
    username,
    password,
    avatar,
    refreshTokenHash,
	is_active,
  };
}
export async function addMatch(
  server,
  { winner_id, loser_id, winner_score, loser_score, date }
) {
  const stmt = server.db.prepare(`
    INSERT INTO matches (winner_id, loser_id, winner_score, loser_score, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    winner_id,
    loser_id,
    winner_score,
    loser_score,
    date
  );

  return {
    id: info.lastInsertRowid,
    winner_id,
    loser_id,
    winner_score,
    loser_score,
    date,
  };
}