import { STATE } from '../config/constant.js'
import { GameLoop } from '../services/GameLoop.js'

export class Room
{
	/**
	 * @param id : number
	 * @param players : Array
	 * @param maxPlayers : number
	 */
	constructor(id, players, maxPlayers)
	{
		this.id = id;
		this.maxPlayers = maxPlayers;
		this.GameLoop = null;
		this.players = null;
		players.array.forEach((element) => {
			this.addPlayerInRoom(element);
		});
		console.log("GAME-ROOM: new room created");
	}

	addPlayerInRoom(newPlayer)
	{
		if (!newPlayer || newPlayer.id === -1) return false;

		if (this.players.size !== this.maxPlayers) {
			newPlayer.roomId = this.id;
			this.players.set(newPlayer.id, newPlayer);
			console.log("GAME-ROOM: new player added to room ", this.id);
			return true;
		}
		return false;
	}
}