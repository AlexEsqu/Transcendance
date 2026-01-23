import { generateTokens, sendVerificationCodeEmail } from "../../../services/authServices.js";
import { getOauthCallbackSchema } from "../../../schemas/get.callback.schema.js";
import fs from "fs";

const redirectUrl = encodeURI(`${process.env.FRONTEND_DOMAIN_NAME}/oauth/callback`);

export default function getOauthCallback(server) {
	const opts = {
		schema: getOauthCallbackSchema,
	};
	server.get("/oauth/42/callback", opts, async (req, reply) => {
		try {
			const params = prepareParamsFor42TokenExchange(req, reply);
			if (!params) return;
			const { access_token } = await get42Token(params);
			const fortyTwoUserData = await get42User(access_token);
			const user = await isUserInDB(server, fortyTwoUserData);
			if (user) {
				console.log("42 USER IN DB, LOGGING IN THE USER");
				if (user.is_2fa_enabled) {
					console.log("42 USER HAS 2FA ENABLED, SENDING VERIFICATION CODE");
					sendVerificationCodeEmail(server, user, reply);
					reply.setCookie("pending_2fa_uid", user.id, {
						httpOnly: true,
						sameSite: "lax",
						secure: true,
						path: "/api/users/auth/",
						maxAge: 60 * 60, // 1 hour
					});
					return reply.status(302).redirect(`${redirectUrl}?twoFactorRequired=true&id=${user.id}`);
				}
				console.log("42 USER HAS 2FA DISABLED, GENERATING TOKENS");
				await generateTokens(server, user, reply);
				return reply.status(302).redirect(`${redirectUrl}?id=${user.id}`);
			} else {
				console.log("42 USER NOT IN DB, SIGNING UP THE USER");
				//SIGNUP THE USER THEN GENERATE TOKENS
				const result = server.db
					.prepare(`INSERT INTO users (username, email, email_verified, oauth_provider) VALUES (?, ?, ?, ?)`)
					.run(fortyTwoUserData.login, fortyTwoUserData.email, 1, "42");
				const newUser = server.db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
				const avatarPath = await downloadAvatar(fortyTwoUserData.image.versions.small, newUser.id);
				server.db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(avatarPath, newUser.id);
				console.log("42 USER HAS BEEN CREATED, GENERATING TOKENS");
				await generateTokens(server, newUser, reply);
				return reply.status(302).redirect(`${redirectUrl}?id=${newUser.id}`);
			}
		} catch (err) {
			console.log(err);
			reply.clearCookie("state");
			return reply.redirect(`${redirectUrl}?error=oauth_failed`);
		}
	});
}

export async function downloadAvatar(url, userId) {
	const res = await fetch(url);
	if (!res.ok) return null;
	//   const contentType = res.headers.get("content-type");
	const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}/user_${userId}.jpg`;

	const buffer = Buffer.from(await res.arrayBuffer());
	fs.writeFileSync(uploadPath, buffer);
	return uploadPath;
}

export async function isUserInDB(server, user) {
	try {
		const userInDB = await server.db.prepare("SELECT * FROM users WHERE email = ?").get(user.email);
		return userInDB;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

function prepareParamsFor42TokenExchange(req, reply) {
	const cookieState = req.cookies.state;
	// reply.clearCookie("state");
	const ft_state = req.query.state;
	const code = req.query.code;
	const redirectUri = `${process.env.API_DOMAIN_NAME}/users/auth/oauth/42/callback`;
	console.log("FT STATE", ft_state);
	console.log("COOKIE STATE", cookieState);
	if (cookieState != ft_state) {
		console.log("INVALID STATE");
		return reply.redirect(`${redirectUrl}?error=invalid_state`);
	}
	const params = new URLSearchParams();
	params.append("grant_type", "authorization_code");
	params.append("client_id", process.env.FT_CLIENT_ID);
	params.append("client_secret", process.env.FT_CLIENT_SECRET);
	params.append("code", code); 
	params.append("redirect_uri", redirectUri);
	reply.clearCookie("state");
	console.log("HERE", params.toString());
	return params;
}

export async function get42Token(params) {
	try {
		const response = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			body: params.toString(),
		});
		if (!response.ok) {
			const errJson = await response.json();
			console.log(errJson);
			throw new Error(errJson.error_description || "Unknown error");
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

async function get42User(token) {
	try {
		const response = await fetch("https://api.intra.42.fr/v2/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			const errJson = await response.json();
			throw new Error(errJson.error_description || "Unknown error");
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.log(err);
		throw err;
	}
}
