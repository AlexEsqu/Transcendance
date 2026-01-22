export const getResetPasswordSchema = {
	tags: ["auth"],
	description: "Verifies a user's password reset token and redirects to the reset password page where they can reset their password ",
	querystring: {
		token: { type: "string" },
	},
	response: {
		302: {
			description: "Redirects to the reset password page",
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
}
