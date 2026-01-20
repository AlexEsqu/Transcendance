import postLogin from "./post.login.route.js";
import postLogout from "./post.logout.route.js";
import postRefresh from "./post.refresh.route.js";
import postSendVerifyEmail from "./post.send-verify-email.route.js";
import postSignup from "./post.signup.route.js";
import getVerifyEmail from "./get.verify-email.route.js";
import postTwoFactorLogin from "./post.two-factor-login.route.js";
import getOauthCallback from "./oauth/get.callback.route.js";
import getOauthRedirect from "./oauth/get.redirect.route.js";
import postResetPassword from "./post.reset-password.route.js";

export default async function authRoutes(server) {
	server.register(postSignup, { prefix: "api/users" });
	server.register(postLogin, { prefix: "api/users/auth" });
	server.register(postRefresh, { prefix: "api/users/auth" });
	server.register(postLogout, { prefix: "api/users/auth" });
	server.register(getVerifyEmail, { prefix: "api/users/auth" });
	server.register(postSendVerifyEmail, { prefix: "api/users/auth" });
	server.register(postTwoFactorLogin, { prefix: "api/users/auth" });
	server.register(getOauthRedirect, { prefix: "api/users/auth" });
	server.register(getOauthCallback, { prefix: "api/users/auth" });
	server.register(postResetPassword, { prefix: "api/users/auth" });
}
