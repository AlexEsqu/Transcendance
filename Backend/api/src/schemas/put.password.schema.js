import { Security } from "../utils/openApiSecurity.js";

export const putUserPasswordSchema = {
	tags: ["user"],
	security: Security.UserAuth,
	description: "Modifies the password of the user. `This endpoint requires client AND user authentication.`",
	body: {
		type: "object",
		required: ["oldPassword", "newPassword"],
		properties: {
			oldPassword: { type: "string" },
			newPassword: { type: "string", minLength: 8 },
		},
		additionalProperties: false,
	},
	response: {
		200: {
			description: "Updated password successfully",
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
