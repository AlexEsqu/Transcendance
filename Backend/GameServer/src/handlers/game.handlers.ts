import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';
import { getJSONError } from '../errors/input.error';
import { GameControl } from '../services/GameControl';
import { Room } from '../services/Room';
import { IPlayer, State, GAME_SIZE, MatchType } from '../config/pongData';
import { JSONInputsUpdate } from '../config/schemas';
import { notifyPlayersInRoom } from '../utils/broadcast';
import { GameLoop } from '../services/GameLoop';

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
		if (player === undefined || gamingRoom === undefined) {
			socket.send(JSON.stringify(getJSONError("Bad request", 400)));
			throw new Error("GAME-HANDLER: player or gaming room not found, can't handle user message on 'room/game' route");
		}

		if (player.username === data.username)
			player.socket = socket;

		//	Send game first data to players so they can start to display something
		if (gamingRoom.gameLoop && gamingRoom.gameLoopStarted === false)
			notifyPlayersInRoom(gamingRoom, gamingRoom.gameLoop.composeGameState());

		//	Check if player informs that its ready
		if (data.ready === true)
			player.isReady = true;
		else
			player.isReady = false;

		//	If all players are ready launch the game
		if (gamingRoom.isEveryoneReady() === true && gamingRoom.gameLoopStarted === false)
			gamingRoom.startGame(gameControl);

		//	If player is ready & wants to move, update its paddle pos
		if (gamingRoom.isEveryoneReady() === true && data.move)
			gamingRoom.handlePlayerInput(player.username, data.state, data.move);

		return (player);

	} catch (error) {
		console.error(error);
		return (undefined);
	}
}

function handleDisconnection(socket: WSWebSocket, gameControl: GameControl): void
{
	const player: IPlayer | null = gameControl.findPlayerBySocket(socket);
	if (player === null) {
		console.log("GAME-HANDLER: on route '/room/game' disconnection of client");
		socket.close();
		return ;
	}

	console.log("GAME-HANDLER: on route '/room/game' disconnection of player ", player?.username);
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

	//	If game started && the match is a tournament = TO DO --> test the situation
	if (gamingRoom.gameLoop.leftPadd.player && gamingRoom.gameLoop.rightPadd.player)
	{
		//	If game started, the opponent that didn't disconnected wins
		if (gamingRoom.gameLoop.leftPadd.player.username === player.username)
			gamingRoom.gameLoop.rightPadd.score = gamingRoom.gameLoop.INFO.MAX_SCORE;
		else if (gamingRoom.gameLoop.rightPadd.player.username === player.username)
			gamingRoom.gameLoop.leftPadd.score = gamingRoom.gameLoop.INFO.MAX_SCORE;
		if (gamingRoom.players.has(player.username))
		{
			//	Only if the match is a tournament && player is disconnected but not currently playing
			const disconnected = gamingRoom.players.get(player.username);
			if (disconnected !== undefined)
			{
				disconnected.socket?.close();
				disconnected.socket = null;
			}
			gamingRoom.gameLoop.state = State.play;
		}
		else {
			gamingRoom.gameLoop.state = State.end;
			console.log("GAME-HANDLER: disconnection of a player but player not found in the gaming room");
		}
	}
	notifyPlayersInRoom(gamingRoom, `${player.username} has left room ${gamingRoom.id}`);
}
