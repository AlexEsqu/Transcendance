import bcrypt from "bcrypt";
import { server } from "../app.js";
export function createAccessToken(id, username) {
	const token = server.jwt.sign(
		{
			id: id,
			username: username,
		},
		{ expiresIn: "10m" }
	);
	return token;
}

export function createRefreshToken(id, username) {
	return server.jwt.sign(
		{ id, username },
		{ expiresIn: "7d" }
	);
}

export async function hashRefreshToken(token) {
	return await bcrypt.hash(token, await bcrypt.genSalt(10));
}