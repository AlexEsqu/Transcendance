import login from "./login.js";
import logout from "./logout.js";
import refresh from "./refresh.js";
import sendMailVerification from "./sendMailVerification.js";
import signup from "./signup.js";
import verifyEmail from "./verifyEmail.js";
import login_2fa from "./2faLogin.js";
import { ft_OAuth2_callback } from "./ft_oauthCallback.js";
import ft_OAuth2 from "./ft_oauth.js";

export default async function authRoutes(server) {
	server.register(signup, { prefix: "api/users" });
	server.register(login, { prefix: "api/users/auth" });
	server.register(refresh, { prefix: "api/users/auth" });
	server.register(logout, { prefix: "api/users/auth" });
	server.register(verifyEmail, { prefix: "api/users/auth" });
	server.register(sendMailVerification, { prefix: "api/users/auth" });
	server.register(login_2fa, { prefix: "api/users/auth" });
	server.register(ft_OAuth2, { prefix: "api/users/auth" });
	server.register(ft_OAuth2_callback, { prefix: "api/users/auth" });
}
