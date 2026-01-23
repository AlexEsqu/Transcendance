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
	try {
		//	Must parse and validate received message
		const data: JSONRoomDemand = JSON.parse(message.toString());
		if (!validateSchema(data)) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			console.log("GAME-WAIT-HANDLER: received a bad request from a client");
			return ({ username: 'NaN', roomId: -1});
		}
		console.log("GAME-WAIT-HANDLER: handle received message");

		//	Add in game controller (manage waiting rooms and gaming rooms)
		const player = gameControl.generatePlayerId(socket, data);
		console.log(player);
		const roomId = gameControl.addPlayerInWaitingRoom(player, data.level) ?? -1;

		return ({ username: player.username, roomId: roomId});

	} catch (error) {
		console.error(error);
		return ({ username: 'NaN', roomId: -1});
	}
}

function handleDisconnection(client: { username: string, roomId: number }, gameControl: GameControl)
{
	console.log("GAME-WAIT-HANDLER: disconnection of client ", client.username);
	gameControl.deletePlayerFromRoom(client.username, client.roomId, 'waiting');
}
