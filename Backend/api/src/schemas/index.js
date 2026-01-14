import fp from "fastify-plugin";
import {
	authCredentialsBody,
	errorResponse,
	loginTokenObject,
	matchObject,
	publicUserObject,
	SignupBody,
	SuccessMessageResponse,
	twoFactorRequiredObject,
	userIdObject,
} from "./index.schemas.js";

async function Schemas(server) {
	server.addSchema(authCredentialsBody);
	server.addSchema(errorResponse);
	server.addSchema(SignupBody);
	server.addSchema(SuccessMessageResponse);
	server.addSchema(matchObject);
	server.addSchema(userIdObject);
	server.addSchema(publicUserObject);
	server.addSchema(loginTokenObject);
	server.addSchema(twoFactorRequiredObject);
}

export default fp(Schemas);
