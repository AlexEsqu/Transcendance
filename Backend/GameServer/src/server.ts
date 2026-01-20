import Fastify, { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';

import { registerWaitingRoomRoutes } from './routes/waitingRoom.route'
import { registerGameRoutes } from './routes/game.route'
import { GameControl } from './services/GameControl';

/************************************************************************************************************
 * 		Run Game Server																						*
 ***********************************************************************************************************/

//	Create game server instance
const gameServer: FastifyInstance = Fastify({ logger: {level: 'info'} });

const launchGameServer = async () => {
	const signals = ['SIGTERM', 'SIGINT'];

	signals.forEach(signal => {
		//	When a signal is catched clean data, close sockets and quit the server
		process.on(signal, async () => {
			gameServer.log.info(`GAME-SERVER received ${signal}, closing server`);
			console.log(`GAME-SERVER received ${signal}, closing server`);

			try {
				await gameServer.close();
				gameServer.log.info(`GAME-SERVER closed successfully`);
				console.log(`GAME-SERVER closed successfully`);
				process.exit(0);
			} catch (err) {
				gameServer.log.error(`GAME-SERVER catched an error during shutdown`);
				console.error(`GAME-SERVER catched an error during shutdown`);
				process.exit(1);
			}
		});
	});

	try {
		const port = process.env.PORT ?? "4001";
		const host = process.env.HOST ?? "0.0.0.0";

		const gameControl = new GameControl() as GameControl | null;
		if (!gameControl) throw new Error("failed to create 'gameControl'");

		//	Register plugins/external routes
		await gameServer.register(websocket);
		await registerWaitingRoomRoutes(gameServer, gameControl);
		await registerGameRoutes(gameServer, gameControl);

		//	Listen on port
		await gameServer.listen({ port: parseInt(port), host: host }, (address) => {
			// console.log(`GAME-SERVER: ${address} listening`);
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

launchGameServer();
