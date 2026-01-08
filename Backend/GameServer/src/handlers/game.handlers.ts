import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';
import { getJSONError } from '../errors/input.error';
import { GameControl } from '../services/GameControl';
import { Room } from '../services/Room';
import { IPlayer } from '../config/pongData';
import { IGameMessage } from '../config/schemas';

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WSWebSocket, message: Buffer, 
	validateSchema: ValidateFunction, gameControl: GameControl): IPlayer | undefined
{
	console.log("GAME-SERVER: handle received message from '/room/game'' route");
	try {
		//	Must parse and validate received message
		const data = JSON.parse(message.toString()) as IGameMessage;
		if (!validateSchema(data) || data === undefined || !data) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			throw new Error("message received doesn't match with 'validateSchema' on '/room/game''") ;
		}

		const player: IPlayer | undefined = gameControl.getPlayer(data.roomId, data.id);
		const gamingRoom: Room | undefined = gameControl.getGamingRoom(data.roomId);

		if (player === undefined || gamingRoom === undefined)
			throw new Error("player or gaming room not found, can't handle user message");

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
			gamingRoom.handlePlayerInput(player.id, data.move);

		return (player);

	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

function handleDisconnection(player: IPlayer | undefined, gameControl: GameControl)
{
	console.log("GAME-HANDLER: disconnection of client ", player?.id);
	if (player)
		gameControl.deletePlayerFromRoom(player.id, player.roomId ?? -1);
}