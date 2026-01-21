export const getOauthRedirectSchema = {
	tags: ["OAuth"],
	description: "Redirects the user to the 42 authorize page",
	responses: {
		302: {
			description: "Redirects to the 42 authorization page",
			headers: {
				location: { type: "string" },
			},
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
