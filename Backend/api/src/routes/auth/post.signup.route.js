import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";
import crypto from "crypto";
import { signupSchema } from "../../schemas/post.signup.schema.js";
export default function signup(server) {
	const opts = {
		schema: signupSchema,
	};
	server.post("/signup", opts, async (request, reply) => {
		const { username, password, email } = request.body;
		const token = crypto.randomBytes(32).toString("hex");
		const expires = Date.now() + 1000 * 60 * 5; // 5 minutes
		const verifyUrl = `${process.env.API_DOMAIN_NAME}/users/auth/verify-email?token=${token}`;

		try {
			// Hash password
			const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));

			// Add user
			const addUser = server.db.prepare(`INSERT INTO users(username, email, password_hash, email_verify_token, email_verify_expires) VALUES (?, ?, ?, ?, ?)`);
			addUser.run(username, email, hash, token, expires);

			// Generate email verification token and send email
			await server.mailer.sendMail({
				from: `"Pong" <${process.env.GMAIL_USER}>`,
				to: email,
				subject: "Verify your email",
				html: `
      				<p>Click the link to verify your email:</p>
     				<a href="${verifyUrl}">${verifyUrl}</a>
    				`,
			});

			return reply.status(201).send({ success: true, message: "Signed up successfully" });
		} catch (err) {
			console.log(err);
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				if (err.message.includes("username")) {
					reply.status(409).send({
						error: "Conflict",
						message: "Username is already taken",
					});
				}
				const user = await server.db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
					if (err.message.includes("email") && user.email_verified == 0) {
					reply.status(409).send({
						error: "Conflict",
						message: "Email is already taken",
					});
				}
				if (err.message.includes("email")) {
					reply.status(409).send({
						error: "Conflict",
						message: "Email is already taken",
					});
				}
			}
			handleSQLiteError(err, reply);

			reply.status(500).send({
				error: "Internal Server Error",
				message: err.message,
			});
		}
	});
}
