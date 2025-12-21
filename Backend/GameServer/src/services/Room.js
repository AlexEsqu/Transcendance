import { STATE } from '../config/constant'
import { GameLoop } from '../services/GameLoop'

export class Room
{
	/**
	 * 
	 * @param id : number
	 * @param players : Array
	 * @param maxPlayers : number
	 */
	constructor(id, players, maxPlayers)
	{
		this.id = id;
		this.maxPlayers = maxPlayers;
		this.players = players;
		this.GameLoop = new GameLoop();
	}


}