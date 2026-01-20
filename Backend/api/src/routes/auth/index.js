import login from "./post.login.route.js";
import logout from "./post.logout.route.js";
import refresh from "./post.refresh.route.js";
import sendEmailVerificationRoute from "./post.send-verify-email.route.js";
import signup from "./post.signup.route.js";
import verifyEmail from "./get.verify-email.route.js";
import twoFactorLoginRoute from "./post.two-factor-login.route.js";
import oauthCallbackRoute from "./oauth/get.callback.route.js";
import oauthRoute from "./oauth/get.redirect.route.js";

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
