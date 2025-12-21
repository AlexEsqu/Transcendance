'use scrict'

import { GameControl } from '../controllers/GameControl'
import { sendToClient } from '../utils/broadcast'

export { handleNewPlayerConnection, handleMessage, handleDesconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

/**
 * @param connection: SocketStream 
 * @param request: FastifyRequest
 * @param GameControl: GameControl 
 */
function handleNewPlayerConnection(connection, request, GameControl)
{
	const playerId = GameControl.generatePlayerId(connection, request.query.id, request.socket.remoteAddress);
	GameControl.addPlayerInWaitingRoom(playerId);

	//	Notify "in the waiting room"
	sendToClient(connection.socket, {
		message: 'Connected to Pong Game Server'
	});

	return playerId;
}

/**
 * 
 * @param playerId: PLAYER 
 * @param message: string
 * @param GameControl: GameControl
 */
function handleMessage(playerId, message, GameControl)
{
	switch (message)
	{
		case 'ready':
			// Save player as ready in the waiting room
		// case ''
	}
}


// handleDesconnection