import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { registerWaitingRoomRoutes } from './routes/waitingRoom.route'
import { registerGameRoutes } from './routes/game.route'

'use scrict'

//	Create game server instance
const gameServer = Fastify({ logger: true });

/*****************************************************************
 * 		Run Game Server											 *
 *****************************************************************/

const launchGameServer = async () => {
	try {
		//	Register plugins/external routes
		await gameServer.register(websocket);
		await registerWaitingRoomRoutes(gameServer);
		await registerGameRoutes(gameServer);

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