import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';

import { GameControl } from '../services/GameControl';
import { getJSONError } from '../errors/input.error';
import { JSONRoomDemand } from '../config/schemas';
import { IPlayer, State } from '../config/pongData';

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WSWebSocket, message: Buffer, 
	validateSchema: ValidateFunction, gameControl: GameControl): { playerId: string, roomId: number}
{
	console.log("WAIT_HANDLER: handle received message from '/room/waiting' route");
	try {
		//	Must parse and validate received message
		const data: JSONRoomDemand = JSON.parse(message.toString());
		if (!validateSchema(data)) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			return ({ playerId: 'NaN', roomId: -1});
		}

		//	Add in game controller (manage waiting rooms and gaming rooms)
		const playerId = gameControl.generatePlayerId(socket, data);
		const roomId = gameControl.addPlayerInWaitingRoom(playerId) ?? -1;

		return ({ playerId: playerId.username, roomId: roomId});

	} catch (error) {
		console.error(error);
		return ({ playerId: 'NaN', roomId: -1});
	}
}

function handleDisconnection(player: { playerId: string, roomId: number }, gameControl: GameControl)
{
	console.log("GAME-HANDLER: on route '/room/waiting' disconnection of client ", player.playerId);
	gameControl.deletePlayerFromRoom(player.playerId, player.roomId, 'waiting');
}
