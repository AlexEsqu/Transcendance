import { buildServer } from "../src/app.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mockDb from "./mocks/inMemoryDb.js";
import mockApiKey from "./mocks/mockValidateApiKey.js";
import { users } from "./mocks/mockObjects.js";
import mockMailer from "./mocks/mockMailer.js";

let server;

beforeAll(async () => {
	server = buildServer({
		dbOverride: mockDb,
		apiKeyPluginOverride: mockApiKey,
		mailerOverride: mockMailer
	});
	await server.ready();
});

let accessToken;


beforeAll(async () => {
	const response = await server.inject({
		method: "POST",
		url: "/users/auth/login",
		payload: {
			login: users[0].username,
			password: users[0].password,
		},
	});
	if (response.statusCode == 200) {
		users[0].is_active = true;
	}
	expect(response.statusCode).toBe(200);
	accessToken = response.json().accessToken;
});

afterAll(async () => {
	await server.close();
});

describe("POST /users/me/friends", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/users/me/friends",
			payload: {
				id: 0,
			},
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 201 for successful friend request", async () => {
		const friend_id = users[1].id;
		const response = await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: friend_id,
			},
		});
		expect(response.statusCode).toBe(201);
		expect(response.json()).toMatchObject({
			success: true,
			message: `Sucessfully added ${users[1].username} to ${users[0].username}'s friend list`,
		});
	});

	it("returns 409 for friend request already sent", async () => {
		const friend_id = users[1].id;
		const response = await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: friend_id,
			},
		});
		expect(response.statusCode).toBe(409);
		expect(response.json()).toHaveProperty("error", "Conflict");
	});

	it("returns 404 for user not found", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: 0,
			},
		});
		expect(response.statusCode).toBe(404);
		expect(response.json()).toHaveProperty("error", "Not Found");
	});

	it("returns 400 for same user", async () => {
		const response = await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: 1,
			},
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toHaveProperty("error", "Bad Request");
	});
});

describe("DELETE /users/me/friends", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/users/me/friends",
			payload: {
				id: 0,
			},
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 204 for successful friend deletion", async () => {
		const friend_id = users[1].id;
		const response = await server.inject({
			method: "DELETE",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: friend_id,
			},
		});
		expect(response.statusCode).toBe(204);
	});

	it("returns 404 for user not found", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: 0,
			},
		});
		expect(response.statusCode).toBe(404);
		expect(response.json()).toHaveProperty("error", "Not Found");
	});

	it("returns 400 for same user", async () => {
		const response = await server.inject({
			method: "DELETE",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: 1,
			},
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			error: "Bad request",
		});
	});
});

describe("GET /users/me/friends", () => {
	it("returns 401 for not logged in", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/users/me/friends",
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toHaveProperty("error", "Unauthorized");
	});

	it("returns 200 for successful friend list", async () => {
		const friend_id = 2;
		await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: friend_id,
			},
		});
		await server.inject({
			method: "POST",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
			payload: {
				id: 4,
			},
		});
		const response = await server.inject({
			method: "GET",
			url: "/users/me/friends",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-App-Secret": "bgb",
			},
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject([
			{
				id: 2,
				username: users[1].username,
				avatar: users[1].avatar,
				is_active: false,
			},
			{
				id: 4,
				username: users[3].username,
				avatar: users[3].avatar,
				is_active: false,
			},
		]);
	});
});
