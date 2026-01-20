import { Security } from "../utils/openApiSecurity.js";

export const postRefreshSchema = {
	tags: ["auth"],
	description:
		"Uses the refresh token to issue a new access token. The endpoint verifies the refresh token, checks that it is not expired or revoked. This endpoint requires `client authentification` AND `user authentification` AND the refresh cookie stored in the `HttpOnly refreshToken cookie`",
	security: Security.SessionAuth,
	response: {
		200: {
			description: "Returns new access token",
			type: "object",
			properties: {
				accessToken: { type: "string" },
				id: { type: "integer" },
			},
			required: ["accessToken"],
		},
		401: {
			description: "Unauthorized: Invalid credentials",
			$ref: "errorResponse#",
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
};
