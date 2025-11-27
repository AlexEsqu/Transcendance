import { server } from "../server.js";
import bcrypt from "bcrypt";

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

export function createRefreshToken(id, username) {
	return server.jwt.sign(
		{ id, username },
		{ expiresIn: "7d" }
	);
}

export async function hashRefreshToken(token) {
	return bcrypt.hash(token, 10);
}