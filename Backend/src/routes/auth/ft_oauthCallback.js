import crypto from "crypto";
import { generateTokens, sendVerificationCodeEmail } from "../../services/authServices.js";

const redirectUrl = encodeURI(`${process.env.FRONTEND_DOMAIN_NAME}/settings`);

export function ft_OAuth2_callback(server) {
	const opts = {
		schema: {
			tags: ["OAuth"],
			description:
				"Handles the OAuth2 callback from 42. Verifies the authorization code and state, retrieves the user information from 42, and either logs in an existing user or signs up a new user. Returns access tokens if login/signup is successful, or a two-factor authentication token if 2FA is required.",
			querystring: {
				type: "object",
				required: ["code", "state"],
				properties: {
					code: {
						type: "string",
						description: "The code you received as a response of `GET api/users/auth/oauth/42`",
						example: "a3f9c8e2b4d74e0c9f...",
					},
					state: {
						type: "string",
						description: "Unguessable string provided in the in by backend for verification `GET api/users/auth/oauth/42`",
						example: "a3f9c8e2b4d74e0c9f...",
					},
				},
			},
			response: {
				200: {
					description: "Two-factor authentication required",
					type: "object",
					required: ["twoFactorRequired", "token"],
					properties: {
						twoFactorRequired: { type: "boolean" },
						token: { type: "string" },
					},
				},
				302: {
					description: "Sucess: Redirects to the frontend",
					headers: {
						location: { type: "string" },
					},
				},
				500: {
					$ref: "errorResponse#",
				},
				default: {
					$ref: "errorResponse#",
				},
			},
		},
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
					const twoFaToken = await sendVerificationCodeEmail(server, user);
					return reply.status(200).send({
						twoFactorRequired: true,
						token: twoFaToken,
					});
				}
				console.log("42 USER HAS 2FA DISABLED, GENERATING TOKENS");
				await generateTokens(server, user, reply);
				return reply.status(302).redirect(redirectUrl);
			} else {
				console.log("42 USER NOT IN DB, SIGNING UP THE USER");
				//SIGNUP THE USER THEN GENERATE TOKENS
				const result = server.db
					.prepare(`INSERT INTO users (username, email, email_verified, oauth_provider) VALUES (?, ?, 1, 42)`)
					.run(fortyTwoUserData.login, fortyTwoUserData.email);
				const newUser = server.db.prepare(`SELECT * FROM users WHERE id = ?`).get(result.lastInsertRowid);
				const avatarPath = await downloadAvatar(fortyTwoUserData.image.versions.small, newUser.id);
				server.db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(avatarPath, newUser.id);
				console.log("42 USER HAS BEEN CREATED, GENERATING TOKENS");
				await generateTokens(server, newUser, reply);
				return reply.status(302).redirect(redirectUrl);
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
	const ft_state = req.query.state;
	const code = req.query.code;
	const redirectUri = encodeURI(`${process.env.API_DOMAIN_NAME}/users/auth/oauth/42/callback`);
	if (cookieState != ft_state) {
		return reply.redirect(`${redirectUrl}?error=invalid_state`);
	}
	const params = new URLSearchParams();
	params.append("grant_type", "authorization_code");
	params.append("client_id", process.env.FT_CLIENT_ID);
	params.append("client_secret", process.env.FT_CLIENT_SECRET);
	params.append("code", code); // from query
	params.append("redirect_uri", redirectUri);
	reply.clearCookie("state", {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		maxAge: 60 * 5, // 1 minute
	});
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
