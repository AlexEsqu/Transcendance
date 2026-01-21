import { Security } from "../utils/openApiSecurity.js";

export const getUsersSchema = {
	tags: ["user"],
	security: Security.AppAuth,
	description: "Returns a list of all registered users. `This endpoint requires client authentication.`",
	response: {
		200: {
			type: "array",
			items: { $ref: "publicUserObject#" },
		},
	},
};
