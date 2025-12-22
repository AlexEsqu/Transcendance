// import { handleMessage, handleDesconnection } from '../handlers/game.handlers.js'

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerGameRoutes(gameServer, GameControl)
{
	const options = {
		maxPayload: 1024,
		// verifyClient: function that can be used to verify client
	};

	gameServer.get('/game', { websocket: true, options: options }, (connection, request) => {
		//	Handle: first connection of a client
		//	Validate the request, is roomID registered in GameControl

		//	Handle: receiving message from a client
		connection.socket.on('message', (message) => {
			handleMessage(player, message, GameControl);
		});

		//	Handle: closing client connection
		connection.socket.on('close', () => {
			handleDisconnection(player);
		});

		//	Handle: errors!!
		connection.socket.on('error', (error) => {
			console.error("WS-ERROR: ", error);
		});
	});
}