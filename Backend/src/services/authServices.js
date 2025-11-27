import { server } from "../server.js";
export function createAccessToken(id, username) {
	const token = server.jwt.sign(
		{
			id: id,
			username: username,
		},
		{ expiresIn: "3m" }
	);
	return token;
}

export async function createRefreshToken(id, username) {
	const refreshToken = await reply.jwtSign(
		{
			id: id,
			username: username,
		},
		{ expiresIn: "7d" }
	);
	reply.setCookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/api/auth/refresh",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
	return refreshToken;
}
