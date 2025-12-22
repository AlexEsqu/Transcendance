'use scrict'

import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { registerWaitingRoomRoutes } from './routes/waitingRoom.route.js'
import { registerGameRoutes } from './routes/game.route.js'
import { GameControl } from './controllers/GameControl.js';
import { PORT, HOST } from './config/constant.js'
 

//	Create game server instance
const gameServer = Fastify({ logger: true });

/*****************************************************************
 * 		Run Game Server											 *
 *****************************************************************/

const launchGameServer = async () => {
	try {
		const gameControl = new GameControl();
		//	Register plugins/external routes
		await gameServer.register(websocket);
		await registerWaitingRoomRoutes(gameServer, gameControl);
		await registerGameRoutes(gameServer, gameControl);

		//	Listen on port
		await gameServer.listen({ port: PORT, host: HOST }, (address) => {
			console.log("GAME-SERVER: listening");
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

launchGameServer();
