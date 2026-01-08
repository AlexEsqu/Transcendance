export function handleSQLiteError(err, reply) {
	console.error(err); // log full error for debugging

	// Default status
	let statusCode = 500;

	switch (err.code) {
		case "SQLITE_CONSTRAINT_UNIQUE":
			statusCode = 409; // Conflict
			break;
		case "SQLITE_CONSTRAINT_FOREIGNKEY":
			statusCode = 400; // Bad Request
			break;
		case "SQLITE_CONSTRAINT":
			statusCode = 400; // Generic constraint violation
			break;
		case "SQLITE_BUSY":
			statusCode = 503; // Service Unavailable
			break;
		case "SQLITE_ERROR":
		default:
			statusCode = 500; // Internal Server Error
	}
	reply.status(statusCode).send({ error: err.message });
}
