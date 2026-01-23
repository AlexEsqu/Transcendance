export const errorResponse = {
	$id: "errorResponse",
	additionalProperties: false,
	properties: {
		error: { type: "string" },
		message: { type: "string" },
	},
	required: ["error"],
};

export const authCredentialsBody = {
	$id: "authCredentialsBody",
	type: "object",
	properties: {
		login: { type: "string" },
		password: { type: "string" },
	},
	required: ["password", "login"],
};

export const SignupBody = {
	$id: "SignupBody",
	type: "object",
	required: ["username", "password", "email"],
	properties: {
		username: { type: "string", minLength: 3, maxLength: 20 },
		password: { type: "string", minLength: 8 },
		email: { type: "string", format: "email" },
	},
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
	required: ["id", "username", "avatar"],
	properties: {
		id: { type: "integer" },
		username: { type: "string" },
		avatar: { type: ["string", "null"] },
		is_active: { type: "boolean" },
		oauth: { type: "boolean" },
	},
};

export const privateUserObject = {
  $id: "privateUserObject",
  type: "object",
  description: "Private authenticated user data",
  required: [
    "id",
    "username",
    "email",
    "avatar",
    "email_verified",
    "is_2fa_enabled",
    "oauth_provider",
    "matches",
    "is_active",
    "oauth",
	"is_password_set"
  ],
  properties: {
    id: {
      type: "integer",
      example: 1
    },
    username: {
      type: "string",
      minLength: 3,
      maxLength: 32,
      example: "lasablon"
    },
    email: {
      type: "string",
      format: "email",
      example: "lasablon@student.42.fr"
    },
    avatar: {
      type: ["string", "null"],
      format: "uri",
      example: `https://${process.env.API_DOMAIN_NAME}:8443/api/avatars/user_1.jpg`
    },
    email_verified: {
      type: "boolean",
      description: "Whether the user's email is verified",
      example: true
    },
    is_2fa_enabled: {
      type: "boolean",
      description: "Whether two-factor authentication is enabled",
      example: false
    },
    oauth_provider: {
      type: ["string", "null"],
      description: "OAuth provider used for signup",
      example: "42"
    },
    oauth: {
      type: "boolean",
      description: "Whether the user authenticated via OAuth",
      example: true
    },
    is_active: {
      type: "boolean",
      description: "Whether the user account is active",
      example: true
    },
    matches: {
      type: "array",
      description: "List of matches played by the user",
      items: {
        $ref: "matchObject#"
      }
    },
	is_active: {
		type: "boolean",
		description: "Whether the user account is active",
		example: true
	},
	is_password_set: {
		type: "boolean",
		description: "Whether the user has set a password",
		example: true
	}
  },
  additionalProperties: false
};


export const loginTokenObject = {
	$id: "loginTokenObject",
	type: "object",
	required: ["accessToken", "id"],
	properties: {
		accessToken: { type: "string" },
		id: { type: "integer" },
	},
	example: {
		accessToken: "a3f9c8e2b4d74e0c9f...",
		id: 1,
	},
	description: "Login successful",
};

export const twoFactorRequiredObject = {
	$id: "twoFactorRequiredObject",
	type: "object",
	required: ["twoFactorRequired", "token"],
	properties: {
		twoFactorRequired: { type: "boolean", example: true },
		token: { type: "string" },
	},
	example: {
		twoFactorRequired: true,
		token: "a3f9c8e2b4d74e0c9f...",
	},
	description: "Two-factor authentication required",
};
