import { Security } from "../utils/openApiSecurity.js";

export const getUsersSchema = {
	tags: ["user"],
	description: "Returns a list of all registered users. `This endpoint requires client authentication.`",
	response: {
		200: {
			type: "array",
			items: { $ref: "publicUserObject#" },
		},
	},
};
