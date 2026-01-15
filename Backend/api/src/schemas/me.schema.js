import { Security } from "../utils/openApiSecurity.js";


export const getMeSchema = {
	$id: "getMeSchema",
	tags: ["user"],
	type: "object",
	security: Security.UserAuth,
	description: "Returns an object of the current user data. `This endpoint requires user authentication.`",
	response : {
		200: { $ref: "privateUserObject#" },
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
	}

};