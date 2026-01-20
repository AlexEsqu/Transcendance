import { Security } from "../utils/openApiSecurity.js";

export const getUserMatchesSchema = {
	tags: ["matches"],
	description: "Returns a list of all the matches of a user using the user_id parameter. `This endpoint requires client authentication.`",
	security: Security.AppAuth,
	params: { $ref: "userIdObject#" },
	response: {
		200: {
			type: "array",
			items: { $ref: "matchObject#" },
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
			$ref: "errorResponse#",
		},
		default: {
			description: "Unexpected error",
			$ref: "errorResponse#",
		},
	},
};

export const getMatchesSchema = {
	tags: ["matches"],
	description: "Returns a list of all matches. `This endpoint requires client authentication.`",
	security: Security.AppAuth,
	response: {
		200: {
			type: "array",
			items: { $ref: "matchObject#" },
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
