import { Security } from "../utils/openApiSecurity.js";

export const putUserAvatarSchema = {
	schema: {
		id$: "putUserAvatarSchema",
		tags: ["user"],
		description: "Modifies the avatar of the user. `This endpoint requires client AND user authentication.`",
		security: Security.UserAuth,
		consumes: ["multipart/form-data"],
		body: {
			type: "object",
			required: ["avatar"],
			properties: {
				avatar: { isFile: true },
			},
		},
		response: {
			200: {
				description: "Updated avatar successfully",
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
			413: {
				description: "Payload too large",
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

export const deleteUserAvatarSchema = {
	schema: {
		id$: "deleteUserAvatarSchema",
		tags: ["user"],
		description: "Deletes the avatar of the user. `This endpoint requires client AND user authentication.`",
		security: Security.UserAuth,
		response: {
			204: {
				description: "Success: Avatar deleted successfully",
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
		},
	},
};
