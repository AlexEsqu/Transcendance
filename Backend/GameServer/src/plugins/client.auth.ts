import jwt from '@fastify/jwt';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function registerAuthPlugin(gameServer: FastifyInstance)
{
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret || jwtSecret === undefined)
		throw new Error("'JWT_SECRET env variable is not set, can't continue");

	gameServer.register(jwt, {
		secret: jwtSecret,
	});

	//	Add a Hook to verify JWT secret of the request
	gameServer.addHook('preValidation', async (request, reply) => {
		if (request.url.startsWith('/room/'))
		{
			try {
				//	Try to extract token from query
				const queryParams: URLSearchParams = new URLSearchParams(request.url.split('?')[1]);
				const token: string | null = queryParams.get('token');
	
				if (token)
				{
					const decodedUser = gameServer.jwt.verify(token);
					request.user = decodedUser;
					console.log("GAME-SERVER: user has a valid authentication token", request.user);
				}
				else
				{
					// Check if the token is in request's headers
					await request.jwtVerify();
					console.log("GAME-SERVER: user has a valid authentication token (from header)");
				}
			} catch (err) {
				console.log("GAME-SERVER: authentication failed", err);
				reply.code(401).send({ error: 'Unauthorized' });
			}
		}
	});
}