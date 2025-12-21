import { handleNewConnection, handleMessage, handleDesconnection } from '../handlers/waitingRoom.handlers'

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerWaitingRoomRoutes(gameServer, gameControl)
{
	const options = {
		maxPayload: 1024,
		// verifyClient: function that can be used to verify client
	};

	gameServer.get('/waitingRoom', { websocket: true, options: options }, (connection, request) => {
		//	Handle: first connection of a client
		const playerId = handleNewConnection(connection, request, gameControl); 

		//	Handle: receiving message from a client
		connection.socket.on('message', (message) => {
			handleMessage(playerId, message, gameControl);
		});

		//	Handle: closing client connection
		connection.socket.on('close', () => {
			handleDesconnection(playerId);
		});

		//	Handle: errors!!
		connection.socket.on('error', (error) => {
			console.error("WS-ERROR: ", error);
		});
	});
}