import db from "/app/src/database.js";
import bcrypt from "bcrypt";
/*
Refresh Route Logic (correct):

Read cookie refreshToken

If missing → 401

Verify JWT

Token valid? Extract user.id

Create new access token (expires in 15–60 min)

OPTIONAL (recommended): Create new refresh token (rotation)

Set new refresh cookie

Send back { accessToken }

That’s the entire job of a refresh route.
*/

const opts = {
	schema: {
		tags: ["auth"],
	},};

function refresh(server) {
	server.post("/auth/refresh", opts, async (req, reply) => {
		const { refreshToken } = req.cookies;
		if (!refreshToken)
			reply.status(401).send({ error: "Missing token" });
		const payload = await server.jwt.verify(refreshToken);
		const userId = payload.id;
		
		// const refreshToken = await reply.jwtSign(
		// 	{
		// 		name: "bar",
		// 	},
		// 	{ expiresIn: "7d" }
		// );
		// reply.setCookie("refreshToken", refreshToken, {
		// 	httpOnly: true,
		// 	secure: true,
		// 	sameSite: "strict",
		// 	path: "/api/auth/refresh",
		// 	maxAge: 60 * 60 * 24 * 7, // 7 days
		// });
	});
}
