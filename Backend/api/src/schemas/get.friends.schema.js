import { Security } from "../utils/openApiSecurity.js";

export const getFriendsSchema = {
	tags: ["user"],
	security: Security.UserAuth,
	description:
		"Returns the complete list of friends of the authenticated user.
		Returns basic profile information for each friend.
		`This endpoint requires client authentication AND user authentication.`",
	response: {
		200: {
			type: "array",
			items: { $ref: "publicUserObject#" },
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
