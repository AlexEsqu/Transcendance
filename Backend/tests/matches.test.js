// tests/matches.test.js
import { test, expect, beforeEach } from "vitest";
import { buildServer } from "../src/app.js";
import mockDb from "./mocks/inMemoryDb.js";
import mockApiKey from "./mocks/mockValidateApiKey.js";
import { addMatch, addUser } from "./utils/testUtils.js";
let server;

beforeEach(async () => {
	server = buildServer({
		dbOverride: mockDb,
		apiKeyPluginOverride: mockApiKey,
	});

	await server.ready();
});

test("GET /matches returns all seeded matches", async () => {
	// Add mock users first (needed for foreign keys if you enforce them)
	await addUser(server, { username: "user1" });
	await addUser(server, { username: "user2" });

	// Seed matches
	
  // Seed matches using addMtch
	await addMatch(server, { winner_id: 1, loser_id: 2, winner_score: 11, loser_score: 8 });
   	await addMatch(server, { winner_id: 2, loser_id: 1, winner_score: 11, loser_score: 7 });
	// Perform request
	const response = await server.inject({
		method: "GET",
		url: "/matches",
	});

	// Assertions
	expect(response.statusCode).toBe(200);

	const matches = response.json();
	expect(matches).toHaveLength(2);

	// Check if seeded matches exist
	expect(matches).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				winner_id: 1,
				loser_id: 2,
				winner_score: 11,
				loser_score: 8,
			}),
			expect.objectContaining({
				winner_id: 2,
				loser_id: 1,
				winner_score: 11,
				loser_score: 7,
			}),
		])
	);
});
