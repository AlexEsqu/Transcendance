export const postSendVerifyEmailSchema = {
	tags: ["auth"],
	description: "Sends an email verification email to the user's email address",
	body: {
		type: "object",
		required: ["email"],
		properties: {
			email: { type: "string", format: "email" },
		},
	},
	response: {
		200: {
			description: "Success: Email verification email sent",
			$ref: "SuccessMessageResponse#",
		},
		400: {
			description: "Bad Request: Invalid input or missing fields",
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
