import fastify, { FastifyInstance } from 'fastify';
import { handleMessage, handleDisconnection } from '../handlers/waitingRoom.handlers.js';
import { GameControl } from '../controllers/GameControl.js'
import { IPlayer } from '../config/gameData'

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerWaitingRoomRoutes(gameServer: FastifyInstance, gameControl: GameControl)
{
	await gameServer.register(async function (fastify) {
		fastify.get('/waitingRoom', { websocket: true }, (socket, request) => {
			if (!socket) throw new Error("Websocket is missing");
			
			//	Handle: first connection of a client
			console.log("GAME-SERVER: new connection from a client ", socket);

			//	Handler: receiving message from a client
			socket.on('message', (message: Buffer) => {
				console.log("GAME-SERVER: received a message from the client ", socket);
				handleMessage(socket, message, gameControl);
			});
	
			//	Handle: ending client connection properly for the server
			socket.on('close', () => {
				console.log("GAME-SERVER: closed connection from client ", socket);
				handleDisconnection(playerId);
			});
	
			//	Handle: errors!!
			socket.on('error', (error: Error) => {
				console.error("WS-ERROR: ", error);
				throw new Error(error.toString());
			});
		});
	});
}