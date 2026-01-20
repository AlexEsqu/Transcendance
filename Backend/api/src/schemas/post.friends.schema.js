import { Security } from "../utils/openApiSecurity.js";

export const addFriendSchema = {
	tags: ["user"],
	description:
		"Adds a new friend to the authenticated user's friend list.
						The new friend's `id` provided in the request body is validated before the friendship record is created.
						`This endpoint requires client authentication AND user authentication.`",

	security: Security.UserAuth,
	body: { $ref: "userIdObject#" },
	response: {
		201: { $ref: "SuccessMessageResponse#" },
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
		409: {
			description: "Conflict: Friendship already exists",
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
