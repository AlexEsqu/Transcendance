import { Security } from "../utils/openApiSecurity.js";

export const getUserMatchesSchema = {
	schema: {
		id$: "getUserMatchesSchema",
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
	},
};

export const getMatchesSchema = {
	schema: {
		id$: "getMatchesSchema",
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
	},
};

export const postMatchSchema = {
	schema: {
		id$: "postMatchSchema",
		tags: ["matches"],
		description: "Records a completed match between two users, including winner, loser, scores, and match date. `This endpoint requires client authentication.`",
		security: Security.AppAuth,
		body: { $ref: "matchObject" },
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
	},
};
