import { Security } from "../utils/openApiSecurity.js";

export const putUsernameSchema = {
	tags: ["user"],
	security: Security.UserAuth,
	description: "Modifies the username of the user. `This endpoint requires client AND user authentication.`",
	body: {
		type: "object",
		required: ["new_username"],
		properties: {
			new_username: { type: "string", minLength: 3, maxLength: 20 },
		},
		additionalProperties: false,
	},
	response: {
		200: {
			description: "Updated username successfully",
			$ref: "SuccessMessageResponse#",
		},
		400: {
			description: "Bad Request: Invalid input or missing fields",
			$ref: "errorResponse#",
		},
		401: {
			description: "Unauthorized: Invalid credentials",
			$ref: "errorResponse#",
		},
		409: {
			description: "Conflict: Username is taken already",
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
