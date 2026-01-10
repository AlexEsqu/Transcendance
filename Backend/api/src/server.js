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
	if (process.env.NODE_ENV === "development") {
		await seedDatabase(server.db, 50);
	}
};

start();




// // write the api as yaml
// import yaml from "yaml"
// import fs from "fs"
// server.ready((err) => {
// 	if (err) throw err;

// 	const openapiObject = server.swagger();

// 	// Convert JSON -> YAML
// 	const yamlString = yaml.stringify(openapiObject);

// 	// Write file
// 	fs.writeFileSync("/app/docs/api.yaml", yamlString);

// 	console.log("📄 OpenAPI YAML file generated at docs/openapi.yaml");
// });
