import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildServer } from "../src/app.js";
import mockDb from "./mocks/inMemoryDb.js";
import mockApiKey from "./mocks/mockValidateApiKey.js";
import { matches } from "./mocks/mockObjects.js";

let server;

beforeAll(async () => {
	server = buildServer({
		dbOverride: mockDb,
		apiKeyPluginOverride: mockApiKey,
	});
	await server.ready();
});

afterAll(async () => {
	await server.close();
});

describe("GET /matches", () => {
	it("returns all seeded matches", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/matches",
		});

		expect(response.statusCode).toBe(200);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const expectedMatches = matches.map(({ id, ...rest }) => rest);
		expect(response.json()).toEqual(expectedMatches);
	});
});

describe("GET /users/:id/matches", () => {
	it("returns all matches for user 1", async () => {
		const userId = 1;

		const res = await server.inject({
			method: "GET",
			url: `/users/${userId}/matches`,
		});

		expect(res.statusCode).toBe(200);

		const expectedMatches = matches
			.filter(
				(match) =>
					match.winner_id === userId || match.loser_id === userId
			)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(({ id, ...rest }) => rest);

		expect(res.json()).toEqual(expectedMatches);
	});

	it("returns empty array", async () => {
		const userId = 4;

		const res = await server.inject({
			method: "GET",
			url: `/users/${userId}/matches`,
		});

		expect(res.statusCode).toBe(200);

		const expectedMatches = matches
			.filter(
				(match) =>
					match.winner_id === userId || match.loser_id === userId
			)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.map(({ id, ...rest }) => rest);

		expect(res.json()).toEqual(expectedMatches);
	});

	it("returns 404 if user not found", async () => {
		const userId = 5;

		const res = await server.inject({
			method: "GET",
			url: `/users/${userId}/matches`,
		});

		expect(res.statusCode).toBe(404);
		expect(res.json()).toHaveProperty("error", "Not Found");
	});
});
