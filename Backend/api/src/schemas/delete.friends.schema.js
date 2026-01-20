import { Security } from "../utils/openApiSecurity.js";

export const deleteFriendSchema = {
	tags: ["user"],
	description:
		"Deletes a friend from the authenticated user's friend list using the id passed in the body.
			`This endpoint requires client authentication AND user authentication.`",
	security: Security.UserAuth,
	body: { $ref: "userIdObject#" },
	response: {
		204: {
			description: "Success: Friend deleted successfully",
			type: "null",
		},
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
			$ref: "errorResponse#",
		},
		default: {
			description: "Unexpected error",
			$ref: "errorResponse#",
		},
	},
};
