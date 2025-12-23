// import { handleMessage, handleDesconnection } from '../handlers/game.handlers.js'

import { FastifyInstance } from "fastify";
import { GameControl } from "../services/GameControl";

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerGameRoutes(gameServer: FastifyInstance, gameControl: GameControl)
{
	await gameServer.register(async function (fastify) {
		fastify.get('/game', { websocket: true }, (socket, request) => {
			if (!socket) throw new Error("Websocket is missing");

			let playerId: number | null = null;

			//	Handle: first connection of a client
			console.log("GAME-SERVER: new connection from a client ", socket);

			//	Handler: receiving message from a client
			socket.on('message', (message: Buffer) => {
				console.log("GAME-SERVER: received a message from the client ", socket);
				// playerId = handleMessage(socket, message, validateWaitingMessage, gameControl);
			});
	
			//	Handle: ending client connection properly for the server
			socket.on('close', () => {
				console.log("GAME-SERVER: closed connection from client ", socket);
				// handleDisconnection(playerId, gameControl);
			});
	
			//	Handle: errors!!
			socket.on('error', (error: Error) => {
				console.error("WS-ERROR: ", error);
				throw new Error(error.toString());
			});
		});
	});
}