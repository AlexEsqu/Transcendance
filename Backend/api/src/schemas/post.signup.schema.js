export const signupSchema = {
	tags: ["auth"],
	description:
		"Creates a new user account using a username an email and password. Sends a verification email to the user.\
				 Does not automatically log in the user.",
	body: { $ref: "SignupBody" },
	response: {
		201: {
			description: "Signed up user successfully",
			$ref: "SuccessMessageResponse#",
		},
		400: {
			description: "Bad Request: Invalid input or missing fields",
			$ref: "errorResponse#",
		},
		409: {
			description: "Conflict: Username already exists",
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
