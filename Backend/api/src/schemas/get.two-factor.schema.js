import { Security } from "../utils/openApiSecurity.js";

export const getTwoFactorSchema = {
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
