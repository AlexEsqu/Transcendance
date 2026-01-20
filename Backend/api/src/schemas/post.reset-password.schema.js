export const postResetPasswordSchema = {
	tags: ["auth"],
	description: "Reset user password",
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