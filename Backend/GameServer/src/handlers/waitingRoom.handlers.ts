import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';

import { GameControl } from '../services/GameControl.js'
import { getJSONError } from '../errors/input.error';
// import { sendToClient } from '../utils/broadcast.js'

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(
	socket: WSWebSocket, message: Buffer, validateSchema: ValidateFunction, gameControl: GameControl): number
{
	console.log("GAME-SERVER: handle received message from '/waitingRoom' route");
	try {
		//	Must parse and validate received message
		const data = JSON.parse(message.toString());
		if (!validateSchema(data) || data === undefined) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			return -1;
		}

		//	Add in game controller (manage waiting rooms and gaming rooms)
		const playerId = gameControl.generatePlayerId(socket, data);
		gameControl.addPlayerInWaitingRoom(playerId);
		return playerId.id;

	} catch (error) {
		return -1;
	}
	return -1;
	

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


function handleDisconnection(playerId: number | null, gameControl: GameControl)
{
	console.log("GAME-HANDLER: disconnection of client ", playerId);
}