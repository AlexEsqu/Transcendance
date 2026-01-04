import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';
import { getJSONError } from '../errors/input.error';
import { GameControl } from '../services/GameControl';
import { IPlayer } from '../config/gameData';

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WSWebSocket, message: Buffer, 
	validateSchema: ValidateFunction, gameControl: GameControl): IPlayer | null
{
	console.log("GAME-SERVER: handle received message from '/game' route");
	try {
		//	Must parse and validate received message
		const data = JSON.parse(message.toString());
		if (!validateSchema(data) || data === undefined || !data) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			throw new Error("message received doesn't match with 'validateSchema' on '/game'") ;
		}

		const player = gameControl.getPlayer(data);
		const action = gameControl.

		return (player);

	} catch (error) {
		console.error(error);
		return (null);
	}
}

function handleDisconnection(player: { playerId: number, roomId: number }, gameControl: GameControl)
{
	console.log("GAME-HANDLER: disconnection of client ", player.playerId);
	gameControl.deletePlayerFromRoom(player.playerId, player.roomId);
}