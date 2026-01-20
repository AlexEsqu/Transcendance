export const postResetPasswordSchema = {
	tags: ["auth"],
	description: "Sends a password reset email to the user's email address. If the email is not found a 200 is still returned",
	body: {
		type: "object",
		required: ["email"],
		properties: {
			email: { type: "string", format: "email" },
		},
	},
	response: {
		200: {
			description: "Success: Password reset email sent",
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