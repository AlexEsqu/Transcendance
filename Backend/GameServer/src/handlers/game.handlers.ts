import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';
import { getJSONError } from '../errors/input.error';
import { GameControl } from '../services/GameControl';
import { Room } from '../services/Room';
import { IPlayer, State, GAME, MatchType } from '../config/pongData';
import { JSONInputsUpdate } from '../config/schemas';
import { notifyPlayersInRoom } from '../utils/broadcast';

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

		// console.log(`DEBUG `, data.username);
		if (player === undefined || gamingRoom === undefined)
			throw new Error("GAME-HANDLER: player or gaming room not found, can't handle user message on 'room/game' route");

		if (player.username === data.username)
			player.socket = socket;

		if (gamingRoom.gameLoop && gamingRoom.gameLoopStarted === false)
			notifyPlayersInRoom(gamingRoom, gamingRoom.gameLoop.composeGameState());

		//	Check if player informs that its ready
		if (data.ready === true)
			player.isReady = true;
		else
			player.isReady = false;
		
		//	If all players are ready launch the game
		if (gamingRoom.isEveryoneReady() === true && gamingRoom.gameLoopStarted === false)
		{
			gamingRoom.startGame(gameControl);
		}

		//	If player is ready & wants to move, update its paddle pos
		if (gamingRoom.isEveryoneReady() === true && data.move)
			gamingRoom.handlePlayerInput(player.username, data.state, data.move);

		return (player);

	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

function handleDisconnection(player: IPlayer | undefined, gameControl: GameControl): void
{
	console.log("GAME-HANDLER: on route '/room/game' disconnection of player ", player?.username);
	if (player)
	{
		const gamingRoom: Room | undefined = gameControl.getGamingRoom(player.roomId ?? -1);
		if (gamingRoom === undefined)
			return ;

		//	In case the game didn't even started
		if (!gamingRoom.gameLoop)
		{
			gamingRoom.closeRoom();
			gameControl.deleteRoom(gamingRoom.id);
			return ;
		}

		//	If game started && the match is a tournament = TO DO --> handle tricky situation
			if (gamingRoom.gameLoop.leftPadd.player && gamingRoom.gameLoop.rightPadd.player)
			{
				//	If game started, the opponent that didn't disconnected wins
				if (gamingRoom.gameLoop.leftPadd.player.username === player.username)
					gamingRoom.gameLoop.rightPadd.score = GAME.MAX_SCORE;
				else if (gamingRoom.gameLoop.rightPadd.player.username === player.username)
					gamingRoom.gameLoop.leftPadd.score = GAME.MAX_SCORE;
				else if (gamingRoom.players.has(player.username))
				{
					//	If the match is a tournament && player disconnected but not currently playing
					const disconnected = gamingRoom.players.get(player.username);
					if (disconnected !== undefined)
					{
						disconnected.socket?.close();
						disconnected.socket = null;
					}
				}
			}

		if (gamingRoom.gameLoop.leftPadd.player && gamingRoom.gameLoop.rightPadd.player)
		{
			if (gamingRoom.gameLoop.leftPadd.player.username === player.username)
				gamingRoom.gameLoop.rightPadd.score = GAME.MAX_SCORE;
			else
				gamingRoom.gameLoop.leftPadd.score = GAME.MAX_SCORE;
		}
	}
}