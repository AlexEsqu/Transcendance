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
	validateSchema: ValidateFunction, gameControl: GameControl): { username: string, roomId: number}
{
	console.log("WAIT_HANDLER: handle received message from '/room/waiting' route");
	try {
		//	Must parse and validate received message
		const data: JSONRoomDemand = JSON.parse(message.toString());
		if (!validateSchema(data)) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			return ({ username: 'NaN', roomId: -1});
		}

		//	Add in game controller (manage waiting rooms and gaming rooms)
		const player = gameControl.generatePlayerId(socket, data);
		const roomId = gameControl.addPlayerInWaitingRoom(player) ?? -1;

		return ({ username: player.username, roomId: roomId});

	} catch (error) {
		console.error(error);
		return ({ username: 'NaN', roomId: -1});
	}
}

function handleDisconnection(client: { username: string, roomId: number }, gameControl: GameControl)
{
	console.log("GAME-HANDLER: on route '/room/waiting' disconnection of client ", client.username);
	gameControl.deletePlayerFromRoom(client.username, client.roomId, 'waiting');
}
