import bcrypt from "bcrypt";
import { handleSQLiteError } from "../../errors/sqliteErrors.js";
import crypto from "crypto";
export default function signup(server) {
	const opts = {
		schema: {
			tags: ["auth"],
			description:
				"Creates a new user account using a username an email and password. Sends a verification email to the user.\
				 Does not automatically log in the user.",
			body: { $ref: "SignupBody" },
			response: {
				201: {
					description: "Signed up user successfully",
					$ref: "SuccessMessageResponse#",
				},
				400: {
					description: "Bad Request: Invalid input or missing fields",
					$ref: "errorResponse#",
				},
				409: {
					description: "Conflict: Username already exists",
					$ref: "errorResponse#",
				},
				500: {
					description: "Internal Server Error",
					$ref: "errorResponse#",
				},
				default: {
					description: "Unexpected error",
					$ref: "errorResponse#",
				},
			},
		},
	};
	server.post("/signup", opts, async (request, reply) => {
		const { username, password, email } = request.body;
		const token = crypto.randomBytes(32).toString("hex");
		const expires = Date.now() + 1000 * 60 * 60; // 1 hour
		const verifyUrl = `${process.env.DOMAIN_NAME}/users/auth/verify-email?token=${token}`;

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

			reply.status(201).send({ success: true, message: "Signed up successfully" });
		} catch (err) {
			console.log(err);
			if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
				if (err.message.includes("username")) {
					reply.status(409).send({
						error: "Conflict",
						message: "Username is already taken",
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
