import crypto from "crypto";
import { get } from "http";

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
			oAuthURL.searchParams.append("response_type", "code");
			console.log(oAuthURL.href);
			return reply.redirect(oAuthURL.href);
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
				302: {
					description: "Redirects to the frontend",
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
	server.get("/oauth/42/callback", opts, async (req, reply) => {
		const cookieState = req.cookies.state;
		const ft_state = req.query.state;
		const code = req.query.code;
		const redirectUrl = encodeURI(`${process.env.API_DOMAIN_NAME}/users/auth/oauth/42/callback`);
		console.log(redirectUrl)
		const url = "https://api.intra.42.fr/oauth/token";
		if (cookieState != ft_state) {
			reply.status(401).send({ error: "Unauthorized", message: "Invalid state" });
		}
		console.log("state is valid");

		const params = new URLSearchParams();
		params.append("grant_type", "authorization_code");
		params.append("client_id", process.env.FT_CLIENT_ID);
		params.append("client_secret", process.env.FT_CLIENT_SECRET);
		params.append("code", code); // from query
		params.append("redirect_uri", redirectUrl);
		reply.clearCookie("state", {
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			maxAge: 60 * 5, // 1 minute
		});
		return await get42Token(url, params).then(async (result) => {
			const user = await get42User(result.access_token);
			return {email: user.email, username: user.login, avatar: user.image.versions.small  }
		})	
		
	});
}
async function get42Token(url, params) {
	try {
		const response = await fetch(url, {
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