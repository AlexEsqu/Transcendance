import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import websocket from '@fastify/websocket';
import cors from "@fastify/cors";

import { registerWaitingRoomRoutes } from './routes/waitingRoom.route'
import { registerGameRoutes } from './routes/game.route'
import { GameControl } from './services/GameControl';
import { registerAuthPlugin } from './plugins/client.auth';
// import authPlugin from "../../api/src/plugins/";
// add this file in dockerfile 
//	add the checkin in the optiosn with the schema

/************************************************************************************************************
 * 		Run Game Server																						*
 ***********************************************************************************************************/

//	Create game server instance
const gameServer: FastifyInstance = Fastify({ logger: {level: 'info'}});

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
		// const host = process.env.HOST ?? "0.0.0.0";
		const host = "0.0.0.0";

		const gameControl = new GameControl() as GameControl | null;
		if (!gameControl) throw new Error("failed to create 'gameControl'");
		    await gameServer.register(cors, {
            origin: (origin, cb) => {
                if (!origin) {
                    cb(null, true);
                    return;
                }
                const hostname = new URL(origin).hostname;
				console.log(hostname)
                if(hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith("clusters.42.fr")){
                    cb(null, true)
                    return
                }
                cb(new Error("Not allowed"), false)
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        });
		//	Register plugins/external routes
		await gameServer.register(websocket);

		// await gameServer.register(cors, {
		// 	origin: [process.env.FRONTEND_DOMAIN_NAME, "https://localhost:8443"],
		// 	credentials: true,
		// 	methods: ["GET"],
		// 	logLevel: "trace",
		// });

		// await registerAuthPlugin(gameServer);
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
