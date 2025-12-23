import { GameType, IPlayer } from '../config/gameData.js';
import { GameLoop } from './GameLoop';

export class Room
{
	id: number;
	type: GameType;
	GameLoop: GameLoop | null;
	players: Map<number, IPlayer> = new Map<number, IPlayer>();

	constructor(roomId: number, players: Map<number, IPlayer> | IPlayer, gameType: GameType)
	{
		this.id = roomId;
		this.type = gameType;
		this.GameLoop = null;

		if (players instanceof Map) {
			for (const [key, value] of players) {
				this.addPlayerInRoom(value.id, value);
			}
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
}