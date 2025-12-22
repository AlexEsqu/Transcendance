'use scrict'

import { GameControl } from '../controllers/GameControl.js'
// import { sendToClient } from '../utils/broadcast.js'
import { parseMessage } from '../utils/parsing.js'

export { handleNewPlayerConnection, handleMessage, handleDisconnection}

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
	//	Add in game controller (manage waiting rooms and gaming rooms)
	GameControl.addPlayerInWaitingRoom(playerId);

	//	Notify "in the waiting room"
	sendToClient(connection.socket, {
		message: 'Connected to Pong Game Server'
	});

	return playerId;
}

/**
 * @param message: buffer
 * @param GameControl: GameControl
 */
function handleMessage(message, remoteAddress, GameControl)
{
	console.log("GAME-SERVER: waitingRoom route -- handleMessage");
	//	Must parse the type of game (local, 1vs1 or tournament)
	// Validate data format --- TO DO
	const playerData = parseMessage(message);

	// const playerId = GameControl.generatePlayerId(connection, remoteAddress, playerData);
	//	Add in game controller (manage waiting rooms and gaming rooms)
	// GameControl.addPlayerInWaitingRoom(playerId);

	//	Notify "in the waiting room"
	// sendToClient(connection.socket, {
	// 	message: 'Connected to Pong Game Server'
	// });

	// switch (message)
	// {
	// 	case 'ready':
	// 		// Save player as ready in the waiting room
	// 	// case ''
	// }
}


function handleDisconnection(player)
{
	console.log("GAME-HANDLER: disconnection of client ", player.id);
}