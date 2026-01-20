import { Security } from "../utils/openApiSecurity.js";

export const putTwoFactorSchema = {
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
