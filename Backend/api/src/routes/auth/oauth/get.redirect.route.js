import { getOauthRedirectSchema } from "../../../schemas/get.redirect.schema.js";

export default function getOauthRedirect(server) {
	const opts = {
		schema: getOauthRedirectSchema,
	};
	server.get("/oauth/42", opts, (req, reply) => {
		try {
			const state = crypto.randomUUID();
			const redirectUrl = encodeURI(`${process.env.API_DOMAIN_NAME}/users/auth/oauth/42/callback`);
			reply.setCookie("state", state, {
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				path: "/api/users/auth/oauth/42/callback",
				maxAge: 60 * 5, // 5 minutes
			});
			const oAuthURL = new URL(process.env.FT_OAUTH_URL);
			oAuthURL.searchParams.append("client_id", process.env.FT_CLIENT_ID);
			oAuthURL.searchParams.append("redirect_uri", redirectUrl);
			oAuthURL.searchParams.append("state", state);
			oAuthURL.searchParams.append("scope", "public");
			oAuthURL.searchParams.append("response_type", "code");
			// console.log(oAuthURL.href);
			return reply.status(302).redirect(oAuthURL.href);
		} catch (err) {
			console.log(err);
			return reply.status(500).send({ error: "Internal server error", message: err.message });
		}
	});
}