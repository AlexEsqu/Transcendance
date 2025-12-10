export const errorResponse = {
	$id: "errorResponse",
	additionalProperties: false,
	properties: {
		error: { type: "string" },
		message: { type: "string" },
	},
	// required: ["error"],
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
	description: "OK",
	type: "object",
	properties: {
		success: { type: "boolean" },
		message: { type: "string" },
	},
	required: ["success", "message"],
};

export const matchObject = {
	$id: "matchObject",
	type: "object",
	required: ["winner_id", "loser_id", "winner_score", "loser_score", "date"],
	properties: {
		winner_id: { type: "integer" },
		loser_id: { type: "integer" },
		winner_score: { type: "integer" },
		loser_score: { type: "integer" },
		date: { type: "string", format: "date-time" },
	},
};

export const userIdObject = {
	$id: "userIdObject",
	type: "object",
	required: ["id"],
	properties: {
		id: { type: "integer" },
	},
};

export const publicUserObject = {
	$id: "publicUserObject",
	type: "object",
	required: ["id", "username", "avatar_url"],
	properties: {
		id: { type: "integer" },
		username: { type: "string" },
		avatar_url: { type: ["string", "null"] },
	},
};
