import login from "./login.js";
import logout from "./logout.js";
import refresh from "./refresh.js";
import sendMailVerification from "./sendMailVerification.js";
import signup from "./signup.js";
import verifyEmail from "./verifyEmail.js";
import login_2fa from "./2faLogin.js";
export default async function authRoutes(server) {
	server.register(signup, { prefix: "users" });
	server.register(login, { prefix: "users/auth" });
	server.register(refresh, { prefix: "users/auth" });
	server.register(logout, { prefix: "users/auth" });
	server.register(verifyEmail, { prefix: "users/auth" });
	server.register(sendMailVerification, { prefix: "users/auth" });
	server.register(login_2fa, { prefix: "users/auth" });

}
