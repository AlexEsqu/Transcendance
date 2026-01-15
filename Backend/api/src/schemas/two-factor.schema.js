import { Security } from "../utils/openApiSecurity.js";

export const getTwoFactorStatusSchema = {
	description: "Returns 2fa activation status",
	security: Security.UserAuth,
	tags: ["user"],
	response: {
		200: {
			description: "Returns 2fa activation status",
			type: "object",
			required: ["is_2fa_enabled"],
			properties: { is_2fa_enabled: { type: "boolean" } },
		},
		401: {
			description: "Unauthorized: Invalid credentials",
			$ref: "errorResponse#",
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
};

export const updateTwoFactorStatusSchema = {
	tags: ["user"],
	security: Security.UserAuth,
	description: "Enable or disable 2FA for the authenticated user.",
	body: {
		required: ["enabled"],
		type: "object",
		properties: {
			enabled: { type: "boolean" },
		},
	},
	response: {
		200: { description: " 2FA status updated successfully ", $ref: "SuccessMessageResponse#" },
	},
};

export const twoFactorLoginSchema = {
	description: "Verify a user's 2FA code sent during login",
	tags: ["auth"],
	cookies: {
		type: "object",
		required: ["pending_2fa_uid"],
		properties: {
			pending_2fa_uid: {
				type: "integer",
				description: "User ID for pending 2FA stored in cookie",
			},
		},
	},
	body: {
		type: "object",
		required: ["code"],
		description: "6-digit code sent to user email or app",
		properties: {
			code: { type: "string", minLength: 6, maxLength: 6 },
		},
	},
	response: {
		200: {
			description: "Login successful",
			type: "object",
			required: ["accessToken", "id"],
			properties: {
				accessToken: { type: "string" },
				id: { type: "integer" },
			},
		},

		401: {
			description: "Unauthorized: Invalid token or code",
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
