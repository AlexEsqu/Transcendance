export const getOauthCallbackSchema = {
	tags: ["OAuth"],
	description:
		"Handles the OAuth2 callback from 42. Verifies the authorization code and state,\
		 retrieves the user information from 42, and either logs in an existing user or signs up a new user. \
		`Stores refresh token in cookies` if login/signup is successful and `put the user's id in query`, \
		or returns a two-factor authentication boolean if the user has enabled 2FA indicating \
		 that the authentication process continues by calling the `two-factor login` endpoint. ",
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
		302: {
			type: "object", 
			description: "Redirects to frontend after OAuth login. May include `id` query or `twoFactorRequired` flag.",
			headers: {
				type: "object",
				required: ["location"],
				properties: {
					location: {
						type: "string",
						description: "Frontend URL with query parameters (user id or 2FA flag)",
						example: "https://frontend.example.com/?id=123",
					},
				},
			},
			additionalProperties: true, 
		},
		500: {
			$ref: "errorResponse#",
		},
		default: {
			$ref: "errorResponse#",
		},
	},
};
