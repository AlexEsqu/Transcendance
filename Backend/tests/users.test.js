import { buildServer } from "../src/app.js";
import { describe, it, expect, beforeAll, afterAll, mock, vi } from "vitest";
import mockDb from "./mocks/inMemoryDb.js";
import mockApiKey from "./mocks/mockValidateApiKey.js";
import { users } from "./mocks/mockObjects.js";
import mockMailer from "./mocks/mockMailer.js";
let server;

import fs from "fs";
import path from "path";
import FormData from "form-data";
beforeAll(async () => {
	server = buildServer({
		dbOverride: mockDb,
		apiKeyPluginOverride: mockApiKey,
		mailerOverride: mockMailer,
	});
	await server.ready();
});

let accessToken;

beforeAll(async () => {
	users[0].is_active = true;
	const response = await server.inject({
		method: "POST",
		url: "/api/users/auth/login",
		payload: { login: users[0].username, password: users[0].password },
	});
	expect(response.statusCode).toBe(200);
	accessToken = response.json().accessToken;
});
afterAll(async () => {
	await server.close();
});

//TESTING GET /USERS
describe("GET /users", () => {
	it("returns all users", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/api/users",
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject(
			users.map((user) => ({
				id: user.id,
				username: user.username,
				avatar: user.avatar,
				is_active: user.is_active,
			}))
		);
	});
});

describe("GET /users/:id", () => {
	it("returns a single user", async () => {
		const userId = 1;

		const response = await server.inject({
			method: "GET",
			url: `api/users/${userId}`,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			id: users[0].id,
			username: users[0].username,
			avatar: users[0].avatar,
			is_active: users[0].is_active,
		});
	});

	it("returns 404 for non-existing user", async () => {
		const userId = 99;
		const response = await server.inject({
			method: "GET",
			url: `/users/${userId}`,
		});
		expect(response.statusCode).toBe(404);
		expect(response.json()).toHaveProperty("error", "Not Found");
	});

	it("returns 400 for bad request", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/api/users/wkjqbhdijb",
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toHaveProperty("error", "Bad Request");
	});
});

describe("POST /users/auth/login", () => {
	it("POST /users/auth/login returns 200 for valid credentials", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/api/users/auth/login",
			payload: {
				login: users[0].username,
				password: users[0].password,
			},
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toHaveProperty("accessToken");
		return response.json().accessToken;
	});
});

describe("POST /users/auth/send-mail-verification", () => {
	it("returns 400 for already verified", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/api/users/auth/send-mail-verification",
			body: {
				email: users[0].email,
			},
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toHaveProperty("error", "Bad Request");
	});

	it.skip("returns 200 for successful email sent", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/api/users/auth/send-mail-verification",
			body: {
				email: users[1].email,
			},
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toHaveProperty("success", true);
	});
});

describe("PUT /users/me/password", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/password",
			payload: {
				oldPassword: "password",
				newPassword: "newPassword",
			},
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 200 for successful password change", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/password",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				oldPassword: users[0].password,
				newPassword: "newPassword",
			},
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toHaveProperty("message", "Updated password successfully");
	});
});

describe("PUT /users/me/avatar", () => {
	it("returns 401 if not logged in", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/avatar",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("updates avatar successfully for logged-in user", async () => {
		// Path to a test image in your project
		const filePath = path.join(process.cwd(), "/tests/img/avatar.jpg");
		const form = new FormData();
		form.append("avatar", fs.createReadStream(filePath));

		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/avatar",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
				...form.getHeaders(), // important: sets proper multipart headers
			},
			payload: form,
		});

		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			success: true,
			message: "Updated avatar successfully",
		});
	});

	it("returns 413 for file too large", async () => {
		// Path to a test image in your project
		const filePath = path.join(process.cwd(), "/tests/img/largeImage.jpeg");
		const form = new FormData();
		form.append("avatar", fs.createReadStream(filePath));

		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/avatar",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
				...form.getHeaders(), // important: sets proper multipart headers
			},
			payload: form,
		});
		expect(response.statusCode).toBe(413);
		expect(response.json()).toMatchObject({
			error: "Payload Too Large",
			message: "request file too large",
		});
	});
});

describe("DELETE /users/me/avatar", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/api/users/me/avatar",
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 204 for successful avatar deletion", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/api/users/me/avatar",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
		});

		expect(response.statusCode).toBe(204);
	});
});

describe("PUT /users/me/username", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/username",
			payload: {
				newUsername: "newUsername",
			},
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 200 for successful username change", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/username",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				new_username: "newUsername",
			},
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			success: true,
			message: "Updated username successfully",
		});
	});

	it("returns 409 for username taken", async () => {
		const response = await server.inject({
			method: "PUT",
			url: "/api/users/me/username",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				new_username: "user2",
			},
		});
		expect(response.statusCode).toBe(409);
		expect(response.json()).toMatchObject({
			error: "Conflict",
			message: "Username is taken already",
		});
	});
});

describe("DELETE /users/me", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/api/users/me",
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 204 for successful user deletion", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/api/users/me",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
		});
		expect(response.statusCode).toBe(204);
	});
});


// // Mock only the helpers
// vi.mock("../src/routes/auth/ft_oAuth2.js", async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     ...actual,
//     get42Token: vi.fn().mockResolvedValue({ access_token: "fake-token" }),
//     get42User: vi.fn().mockResolvedValue({
//       login: "jdoe",
//       email: "jdoe@42.fr",
//       image: { versions: { small: "https://avatar.url/jdoe.png" } },
//     }),
//     downloadAvatar: vi.fn().mockResolvedValue("/avatars/jdoe.png"),
//   };
// });


// describe("POST /api/users/auth/oauth/42", () => {
// 	it("return 302 for successful redirect to 42 api", async () => {
		
// 		const res = await server.inject({
// 			method: "GET",
// 			url: "/api/users/auth/oauth/42",
// 		});
// 		expect(res.location)
// 		expect(res.statusCode).toBe(302);
// 	});
// });

// describe("GET /api/users/auth/oauth/42/callback", () => {
//   it("logs in existing user and sets refresh cookie", async () => {
//     // seed DB
//     server.db.prepare(`
//       INSERT INTO users (id, username, email, email_verified, oauth_provider)
//       VALUES (1, 'jdoe', 'jdoe@42.fr', 1, 42)
//     `).run();

//     const res = await server.inject({
//       method: "GET",
//       url: "/api/users/auth/oauth/42/callback?code=abc&state=ok",
//       cookies: { state: "ok" },
//     });

//     expect(res.statusCode).toBe(302); // or 302 depending on redirect
//     expect(res.json()).toHaveProperty("accessToken");
//   });
// });