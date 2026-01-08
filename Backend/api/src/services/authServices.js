import bcrypt from "bcrypt";
import crypto from "crypto";

export function createAccessToken(server, id, username) {
	// Use the injected server instance instead of server
	const accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME_IN_MINUTES;
	const token = server.jwt.sign({ id, username }, { expiresIn: `${accessTokenLifetime}m` }, { type: "user" });

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

export async function sendVerificationCodeEmail(server, user) {
	const code = crypto.randomInt(100000, 999999).toString();
	const codeHash = crypto.createHmac("sha256", process.env.OTP_SECRET).update(code).digest("hex");
	const expires = Date.now() + 1000 * 60 * 5; // 5 minutes
	const twoFaToken = crypto.randomUUID();

	server.db.prepare(`UPDATE users SET code_hash_2fa = ?, code_expires_2fa = ?, token_2fa = ? WHERE id = ?`).run(codeHash, expires, twoFaToken, user.id);
	await server.mailer.sendMail({
		from: `"Pong" <${process.env.GMAIL_USER}>`,
		to: user.email,
		subject: "Your 6-digit verification code",
		html: `
      				<p>Your 6-digit verification code is: ${code}</p>
    				`,
	});
	return twoFaToken;
}
