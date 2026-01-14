import { Security } from "../utils/openApiSecurity.js";

export const deleteUserSchema = {
	tags: ["user"],
	description: "Deletes the user account and all its data. `This endpoint requires client AND user authentication.`",
	security: Security.UserAuth,
	response: {
		204: {
			description: "Success: User deleted successfully",
			type: "null",
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
	}
};