import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';

import { GameControl } from '../services/GameControl.js'
import { getJSONError } from '../errors/input.error';

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WSWebSocket, message: Buffer, 
	validateSchema: ValidateFunction, gameControl: GameControl): { playerId: number, roomId: number}
{
	console.log("GAME-SERVER: handle received message from '/room/waiting' route");
	try {
		//	Must parse and validate received message
		const data = JSON.parse(message.toString());
		if (!validateSchema(data) || data === undefined) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			return ({ playerId: -1, roomId: -1});
		}

		//	Add in game controller (manage waiting rooms and gaming rooms)
		const playerId = gameControl.generatePlayerId(socket, data);
		const roomId = gameControl.addPlayerInWaitingRoom(playerId) ?? -1;

		return ({ playerId: playerId.id, roomId: roomId});

	} catch (error) {
		console.error(error);
		return ({ playerId: -1, roomId: -1});
	}
}

function handleDisconnection(player: { playerId: number, roomId: number }, gameControl: GameControl)
{
	console.log("GAME-HANDLER: disconnection of client ", player.playerId);
	gameControl.deletePlayerFromRoom(player.playerId, player.roomId);
}