import fastify from 'fastify';
import { handleMessage, handleDisconnection } from '../handlers/waitingRoom.handlers.js';
import websocket from '@fastify/websocket';


/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerWaitingRoomRoutes(gameServer, gameControl)
{
	// const options = {
	// 	maxPayload: 1024,
	// 	// verifyClient: function that can be used to verify client
	// };
	await gameServer.register(async function (fastify) {
		fastify.get('/waitingRoom', { websocket: true }, (socket, request) => {
			//	Handle: first connection of a client
			// const playerId = handleNewConnection(connection, request, gameControl); 
				console.log("HERE");
			if (!socket) return ;

			//	Handle: receiving message from a client
			socket.on('message', (message) => {
				console.log("HELLO");
				handleMessage(message, gameControl);
			});
	
			//	Handle: closing client connection
			socket.on('close', () => {
				handleDisconnection(playerId);
			});
	
			//	Handle: errors!!
			socket.on('error', (error) => {
				console.error("WS-ERROR: ", error);
			});
		});
	});
}