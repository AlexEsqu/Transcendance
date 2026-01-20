import { Security } from "../utils/openApiSecurity.js";

export const postMatchesSchema = {
	tags: ["matches"],
	description: "Records a completed match between two users, including winner, loser, scores, and match date. `This endpoint requires client authentication.`",
	security: Security.AppAuth,
	body: { $ref: "matchObject#" },
	response: {
		200: {
			description: "Uploaded new match successfully",
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
