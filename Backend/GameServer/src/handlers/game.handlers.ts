import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';
import { getJSONError } from '../errors/input.error';
import { GameControl } from '../services/GameControl';
import { Room } from '../services/Room';
import { IPlayer, State } from '../config/pongData';
import { JSONInputsUpdate } from '../config/schemas';

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WSWebSocket, message: Buffer, 
	validateSchema: ValidateFunction, gameControl: GameControl): IPlayer | undefined
{
	try {
		//	Must parse and validate received message
		const data: JSONInputsUpdate = JSON.parse(message.toString());
		if (!validateSchema(data) || data === undefined || !data) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			throw new Error("GAME-HANDLER: message received doesn't match with 'validateSchema' on '/room/game' route") ;
		}

		// console.log("GAME-HANDLER: handle received message from '/room/game' route : ", data);

		const player: IPlayer | undefined = gameControl.getPlayer(data.roomId, data.username);
		const gamingRoom: Room | undefined = gameControl.getGamingRoom(data.roomId);

		if (player === undefined || gamingRoom === undefined)
			throw new Error("GAME-HANDLER: player or gaming room not found, can't handle user message on 'room/game' route");

		player.socket = socket;

		//	Check if player informs that its ready
		if (data.ready === true)
			player.isReady = true;
		else
			return (player);
		
		//	If all players are ready launch the game
		if (gamingRoom.isEveryoneReady() === true)
			gamingRoom.startGame(gameControl);

		//	If player is ready & wants to move, update its paddle pos
		if (player.isReady && data.move)
			gamingRoom.handlePlayerInput(player.username, data.state, data.move);

		return (player);

	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

function handleDisconnection(player: IPlayer | undefined, gameControl: GameControl)
{
	console.log("GAME-HANDLER: on route '/room/game' disconnection of client ", player?.id);
	if (player) {
		gameControl.deletePlayerFromRoom(player.username, player.roomId ?? -1, 'game');
	}
}