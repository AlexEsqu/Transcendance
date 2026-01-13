export const oauthCallbackRouteSchema = {
	schema: {
		$id: "oauthCallbackRouteSchema",
			tags: ["OAuth"],
			description:
				"Handles the OAuth2 callback from 42. Verifies the authorization code and state, retrieves the user information from 42, and either logs in an existing user or signs up a new user. \
				`Stores refresh token in cookies` if login/signup is successful and `put the user's id in query`, or returns a two-factor authentication token if 2FA is required. ",
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
					description: "Sucess: Redirects to the frontend, stores the user's id in query parameters",
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
}