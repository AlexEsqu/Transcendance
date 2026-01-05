import crypto from "crypto";
import { generateTokens } from "../../services/authServices.js";

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
					description: "Successful login or 2FA required",
					oneOf: [{ $ref: "loginTokenObject#" }, { $ref: "twoFactorRequiredObject#" }],
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
			const userInfo = await get42User(access_token);
			// console.log(userInfo);
			const user = await isUserInDB(server, userInfo);
			if (user) {
				if (user.is_2fa_enabled) {
					sendVerificationCodeEmail(server, user);
					return reply.status(200).send({
						twoFactorRequired: true,
						token: twoFaToken,
					});
				}
				const tokens = await generateTokens(server, user, reply);
				// console.log(tokens);
				return reply.status(200).send(tokens);
			} else {
				//SIGNUP THE USER THEN
				console.log(userInfo.image.versions);
				const avatarPath = await downloadAvatar(userInfo.image.versions.small);
				server.db.prepare(`INSERT INTO users (username, email, avatar, email_verified, oauth_provider) VALUES (?, ?, ?, 1, 42)`).run(userInfo.login, userInfo.email, avatarPath);
				const tokens = await generateTokensgenerateTokens(server, user, reply);
				return reply.status(200).send(tokens);
			}
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});
}

export async function downloadAvatar(url) {
	const res = fetch(url);
	if (!res.ok) return null;
	//   const contentType = res.headers.get("content-type");
	const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}/user_${id}.jpg`;

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
		reply.status(401).send({ error: "Unauthorized", message: "Invalid state" });
		return null;
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
