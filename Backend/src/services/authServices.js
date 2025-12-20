import bcrypt from "bcrypt";


export function createAccessToken(server, id, username) {
  // Use the injected server instance instead of server
  const token = server.jwt.sign(
    { id, username },
    { expiresIn: "5m" } // TODO: adjust
  );

  // Update last_activity in DB
  const date = new Date();
  const sqliteDate = date.toISOString();
  server.db.prepare(`UPDATE users SET last_activity = ? WHERE id = ?`).run(sqliteDate, id);

  return token;
}

/**
 * Creates a refresh token using the provided server instance
 */
export function createRefreshToken(server, id, username) {
  return server.jwt.sign(
    { id, username },
    { expiresIn: "7d" } // TODO: adjust
  );
}

/**
 * Hashes a refresh token
 */
export async function hashRefreshToken(token) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}
