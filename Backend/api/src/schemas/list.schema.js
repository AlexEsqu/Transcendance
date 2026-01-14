import { Security } from "../utils/openApiSecurity.js";

export const getUserSchema = {
	tags: ["user"],
	description: "Returns an object of an user using the id passed in parameters. `This endpoint requires client authentication.`",
	security: Security.AppAuth,
	params: { $ref: "userIdObject#" },
	response: {
		200: { $ref: "publicUserObject#" },
		400: {
			description: "Bad Request: Invalid input or missing fields",
			$ref: "errorResponse#",
		},
		401: {
			description: "Unauthorized: Invalid credentials",
			$ref: "errorResponse#",
		},
		404: {
			description: "Not Found: User not found",
			$ref: "errorResponse#",
		},
		500: {
			description: "Internal Server Error",
			type: "object",
			properties: {
				error: { type: "string" },
				message: { type: "string" },
			},
		},
		default: {
			description: "Unexpected error",
			$ref: "errorResponse#",
		},
	},
};

export const getUsersSchema = {
	tags: ["user"],
	security: Security.AppAuth,
	description: "Returns a list of all registered users. `This endpoint requires client authentication.`",
	response: {
		200: {
			type: "array",
			items: { $ref: "publicUserObject#" },
		},
	},
};
