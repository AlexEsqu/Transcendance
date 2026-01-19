
export const confirmEmailChangeSchema = {
	tags: ["user"],
	description:
		"Changes a user's email address using a `one-time token` sent by email.\
			The user clicks a verification link received by email.\
			If the token is valid and not expired, the email is marked as verified\
			and the user is redirected to the frontend application.\
  			",
	querystring: {
		type: "object",
		required: ["token"],
		properties: {
			token: {
				type: "string",
				description: "Email verification token sent to the user by email",
				example: "a3f9c8e2b4d74e0c9f...",
			},
		},
	},
	response: {
		302: {
			description: "Email successfully changed. User is redirected to the frontend.",
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
	},
};