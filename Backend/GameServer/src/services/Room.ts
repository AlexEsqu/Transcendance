import { MatchType, IPlayer, GameLocation } from '../config/pongData';
import { notifyPlayersInRoom } from '../utils/broadcast';
import { GameLoop } from './GameLoop';
import { GameControl } from './GameControl';

/************************************************************************************************************/

export class Room
{
	id: number;
	type: MatchType;
	location: GameLocation;
	gameLoop: GameLoop | null;
	gameLoopStarted: boolean = false;
	players: Map<string, IPlayer> = new Map<string, IPlayer>();

	constructor(roomId: number, players: Map<string, IPlayer> | IPlayer, matchType: MatchType, matchLocation: GameLocation)
	{
		this.id = roomId;
		this.type = matchType;
		this.location = matchLocation;
		this.gameLoop = null;

		if (players instanceof Map) {
			for (const [key, value] of players)
				this.addPlayerInRoom(value.username, value);
		}
		else
			this.addPlayerInRoom(players.username, players);

		console.log("GAME-ROOM: new room created");
	}

	addPlayerInRoom(username: string, player: IPlayer): boolean
	{
		if (this.players.size !== this.type) {
			player.roomId = this.id;
			this.players.set(username, player);
			console.log(`GAME-ROOM: player ${player.username} added to room n'${this.id}`);
			return true;
		}
		else if (this.type === 1) {
			this.players.set(username, player);
			console.log(`GAME-ROOM: player ${player.username} added to room n'${this.id}`);
			return true;
		}
		return false;
	}

	isEveryoneReady(): boolean
	{
		for (const [key, value] of this.players)
		{
			if (value.isReady === false)
				return false;
		}
		return true;
	}

	startGame(gameControl: GameControl): void
	{
		console.log("GAME-ROOM: start game with : ", this.players);
		if (!this.gameLoopStarted && this.gameLoop)
		{
			this.gameLoop.runGameLoop(gameControl);
			this.gameLoopStarted = true;
			notifyPlayersInRoom(this, this.gameLoop.composeGameState());
		}
	}

	handlePlayerInput(player: string, state: number, input: string): void
	{
		if (this.gameLoop)
			this.gameLoop.processPlayerInput(player, state, input);
	}

	createGameLoop(): void
	{
		if (!this.gameLoop)
		{
			console.log("GAME-LOOP: game loop created");
			this.gameLoop = new GameLoop(this.id, this.type, this.players);
		}
	}

	getPlayersArray(): string[]
	{
		let playersArray: string[] = [];
		for (const [key, value] of this.players)
		{
			playersArray.push(value.username);
		}
		return playersArray;
	}

	closeRoom(): void
	{
		for (const [key, value] of this.players)
		{
			if (value.socket)
				value.socket.close();
		}
		this.gameLoop = null;
	}
}