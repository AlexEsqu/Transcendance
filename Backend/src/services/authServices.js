import bcrypt from "bcrypt";


export function createAccessToken(server, id, username) {
  // Use the injected server instance instead of server
  const token = server.jwt.sign(
    { id, username },
    { expiresIn: "10m" } // TODO: adjust
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


export async function generateTokens(server, user, reply) {
	const accessToken = createAccessToken(server, user.id, user.username);
	const refreshToken = createRefreshToken(server, user.id, user.username);

	const refreshTokenHash = await hashRefreshToken(refreshToken);
	const addRefreshToken = server.db.prepare(`UPDATE users SET refresh_token_hash = ? WHERE id = ?`);
	addRefreshToken.run(refreshTokenHash, user.id);
	// set cookie
	reply.setCookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true, // REQUIRED (HTTPS)
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	return {
		accessToken: accessToken,
		id: user.id,
	};
}
