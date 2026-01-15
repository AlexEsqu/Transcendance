import { Security } from "../utils/openApiSecurity.js";

export const logoutSchema = {
	tags: ["auth"],
	description:
		"Logs the user out by invalidating the refresh token stored in the \
				`HttpOnly refreshToken cookie`. After logout, the user must reauthenticate with their\
				 username and password to obtain new tokens. This endpoint requires client authentification \
				 AND user authentification AND the refresh cookie stored in the HttpOnly refreshToken cookie",
	security: Security.SessionAuth,
	response: {
		200: {
			description: "Success: User successfully logged out",
			$ref: "SuccessMessageResponse#",
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
