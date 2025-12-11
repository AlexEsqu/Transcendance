import { buildServer } from "../src/app.js";
import { test, expect, beforeEach } from "vitest";
import mockDb from "./mocks/inMemoryDb.js";
import mockApiKey from "./mocks/mockValidateApiKey.js";
import { addUser } from "./utils/testUtils.js";

let server;

beforeEach(async () => {
	server = buildServer({
		dbOverride: mockDb,
		apiKeyPluginOverride: mockApiKey,
	});

	await server.ready();
});

//TESTING GET /USERS
test("GET /users returns all users", async () => {
	// Seed users
	const user1 = await addUser(server, { username: "alice" });
	const user2 = await addUser(server, { username: "bob" });

	const response = await server.inject({
		method: "GET",
		url: "/users",
	});

	expect(response.statusCode).toBe(200);
	expect(response.json()).toEqual([
		{ id: user1.id, username: "alice", avatar: null, is_active: false },
		{ id: user2.id, username: "bob", avatar: null, is_active: false },
	]);
});

test("GET /users/:id returns a single user", async () => {
	const user = await addUser(server, { username: "charlie" });

	const response = await server.inject({
		method: "GET",
		url: `/users/${user.id}`,
	});

	expect(response.statusCode).toBe(200);
	expect(response.json()).toEqual({
		id: user.id,
		username: "charlie",
		avatar: null,
		is_active: false,
	});
});

test("GET /users/:id returns 404 for non-existing user", async () => {
	await addUser(server, { username: "alice" });
	await addUser(server, { username: "bob" });

	const response = await server.inject({
		method: "GET",
		url: "/users/99",
	});

	expect(response.statusCode).toBe(404);
	expect(response.json()).toEqual({ error: "User not found" });
});

test("GET /users/:id returns 404 for non-existing user", async () => {
	const response = await server.inject({
		method: "GET",
		url: "/users/1",
	});

	expect(response.statusCode).toBe(404);
	expect(response.json()).toEqual({ error: "User not found" });
});

test("GET /users/:id returns 400 for bad request", async () => {
	const response = await server.inject({
		method: "GET",
		url: "/users/wkjqbhdijb",
	});

	expect(response.statusCode).toBe(400);
	expect( response.json()).toHaveProperty("error", "Bad Request");
});
