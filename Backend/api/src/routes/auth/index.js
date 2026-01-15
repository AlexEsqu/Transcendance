import login from "./login.route.js";
import logout from "./logout.route.js";
import refresh from "./refresh.route.js";
import sendEmailVerificationRoute from "./email-verification.send.route.js";
import signup from "./signup.route.js";
import verifyEmail from "./email-verification.route.js";
import twoFactorLoginRoute from "./two-factor-login.route.js";
import oauthCallbackRoute from "./oauth/callback.route.js";
import oauthRoute from "./oauth/redirect.route.js";

export default async function authRoutes(server) {
	server.register(signup, { prefix: "api/users" });
	server.register(login, { prefix: "api/users/auth" });
	server.register(refresh, { prefix: "api/users/auth" });
	server.register(logout, { prefix: "api/users/auth" });
	server.register(verifyEmail, { prefix: "api/users/auth" });
	server.register(sendEmailVerificationRoute, { prefix: "api/users/auth" });
	server.register(twoFactorLoginRoute, { prefix: "api/users/auth" });
	server.register(oauthRoute, { prefix: "api/users/auth" });
	server.register(oauthCallbackRoute, { prefix: "api/users/auth" });
}
