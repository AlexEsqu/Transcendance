export const errorResponse = {
	$id: "errorResponse",
	additionalProperties: false,
	properties: {
		error: { type: "string" },
	},
	required: ["error"],
};

export const authCredentialsBody = {
	$id: "authCredentialsBody",
	type: "object",
	properties: {
		username: { type: "string" },
		password: { type: "string" },
	},
	required: ["username", "password"],
};

export const SignupBody = {
	$id: "SignupBody",
	type: "object",

	properties: {
		username: { type: "string", minLength: 3, maxLength: 20 },
		password: { type: "string", minLength: 8 },
	},
	required: ["username", "password"],
};

export const SuccessMessageResponse = {
	$id: "SuccessMessageResponse",
	type: "object",
	properties: {
		success: { type: "boolean" },
		message: { type: "string" },
	},
	required: ["success", "message"],
};
