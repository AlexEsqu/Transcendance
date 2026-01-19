import { Security } from "../utils/openApiSecurity.js";

export const changeEmailSchema = {
	tags: ["user"],
	security: Security.UserAuth,	
	description: "Changes the email of the user",
	body: {
		type: "object",
		required: ["email"],
		properties: {
			email: { type: "string", format: "email" },
		},
	},
	response: {
		200: {
			description: "Success: Email changed successfully",
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
}