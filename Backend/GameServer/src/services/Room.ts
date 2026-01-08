import { MatchType, IPlayer } from '../config/pongData.js';
import { GameLoop } from './GameLoop';
import { GameControl } from './GameControl';

/************************************************************************************************************/

export class Room
{
	id: number;
	type: MatchType;
	gameLoop: GameLoop | null;
	players: Map<number, IPlayer> = new Map<number, IPlayer>();

	constructor(roomId: number, players: Map<number, IPlayer> | IPlayer, matchType: MatchType)
	{
		this.id = roomId;
		this.type = matchType;
		this.gameLoop = null;

		if (players instanceof Map) {
			for (const [key, value] of players)
				this.addPlayerInRoom(value.id, value);
		}
		else
			this.addPlayerInRoom(players.id, players);

		console.log("GAME-ROOM: new room created");
	}

	addPlayerInRoom(playerId: number, player: IPlayer): boolean
	{
		if (this.players.size !== this.type) {
			player.roomId = this.id;
			this.players.set(playerId, player);
			console.log("GAME-ROOM: new player added to room ", this.id);
			return true;
		}
		return false;
	}

	isEveryoneReady(): boolean
	{
		for (const [key, value] of this.players) {
			if (value.isReady === false)
				return false;
		}
		return true;
	}

	startGame(gameControl: GameControl): void
	{
		this.gameLoop = new GameLoop(this.id, this.type, this.players);
		this.gameLoop.runGameLoop(gameControl);
	}

	handlePlayerInput(playerId: number, input: string): void
	{
		if (this.gameLoop)
			this.gameLoop.processPlayerInput(playerId, input);
	}
}