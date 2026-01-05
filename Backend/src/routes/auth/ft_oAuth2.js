import crypto from "crypto";
import { generateTokens } from "../../services/authServices.js";

export function ft_OAuth2(server) {
	const opts = {
		schema: {
			tags: ["OAuth"],
			description: "Redirects the user to the 42 authorize page",
			responses: {
				302: {
					description: "Redirects to the 42 authorization page",
					headers: {
						location: { type: "string" },
					},
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
	};
	server.get("/oauth/42", opts, (req, reply) => {
		try {
			const state = crypto.randomUUID();
			const redirectUrl = encodeURI(`${process.env.API_DOMAIN_NAME}/users/auth/oauth/42/callback`);
			reply.setCookie("state", state, {
				httpOnly: true,
				secure: true,
				sameSite: "Lax",
				path: "api/users/auth/oauth/42/callback",
				maxAge: 60 * 5, // 1 minute
			});
			const oAuthURL = new URL(process.env.FT_OAUTH_URL);
			oAuthURL.searchParams.append("client_id", process.env.FT_CLIENT_ID);
			oAuthURL.searchParams.append("redirect_uri", redirectUrl);
			oAuthURL.searchParams.append("state", state);
			oAuthURL.searchParams.append("scope", "public");
			oAuthURL.searchParams.append("response_type", "code");
			console.log(oAuthURL.href);
			return reply.status(302).redirect(oAuthURL.href);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error", message: err.message });
		}
	});
}

export function ft_OAuth2_callback(server) {
	const opts = {
		schema: {
			tags: ["OAuth"],
			description: "Verifies the user's 42 authorization code and redirects the user to the frontend",
			querystring: {
				type: "object",
				required: ["code", "state"],
				properties: {
					code: {
						type: "string",
						description: "The code you received as a response of `GET /users/auth/oauth/42`",
						example: "a3f9c8e2b4d74e0c9f...",
					},
					state: {
						type: "string",
						description: "Unguessable string provided in the in by backend for verification `GET /users/auth/oauth/42`",
						example: "a3f9c8e2b4d74e0c9f...",
					},
				},
			},
			responses: {
				200: {
					oneOf: [
						{
							description: "Login successful",
							type: "object",
							required: ["accessToken", "id"],
							properties: {
								accessToken: { type: "string" },
								id: { type: "integer" },
							},
						},
						{
							description: "Two-factor authentication required",
							type: "object",
							required: ["twoFactorRequired", "token"],
							properties: {
								twoFactorRequired: { type: "boolean", example: true },
								token: { type: "string", description: "2FA continuation token" },
							},
						},
					],
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
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
				const avatarPath = await downloadAvatar(userInfo.image.versions.small) ;
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

async function downloadAvatar(url) {
	const res = fetch(url);
	if (!res.ok) return null;
	//   const contentType = res.headers.get("content-type");
	const uploadPath = `${process.env.AVATARS_UPLOAD_PATH}/user_${id}.jpg`;

	const buffer = Buffer.from(await res.arrayBuffer());
	fs.writeFileSync(uploadPath, buffer);
	return uploadPath;
}

async function isUserInDB(server, user) {
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

async function get42Token(params) {
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
