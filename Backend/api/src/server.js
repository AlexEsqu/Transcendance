import { buildServer } from "./app.js";
import { seedDatabase } from "./seed.js";

export const server = buildServer({ useHttps: false });

const start = async () => {
	try {
		await server.listen({
			port: process.env.PORT,
			host: process.env.ADDRESS,
		});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
	// if (process.env.NODE_ENV === "development") {
	// 	await seedDatabase(server.db, 50);
	// }
};

start();