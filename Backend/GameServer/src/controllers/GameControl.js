import { PLAYER } from '../config/data';
import { Room } from '../services/Room'

export class GameControl
{
	constructor()
	{
		this.waitingRoom = Array(0);
		this.gamingRooms = Array<Room>(0);
	}

	addPlayerInWaitingRoom(palyerId)
	{
		this.waitingRoom.push(playerId);
	}

	generatePlayerId(connection, id, remoteAddress)
	{
		let player = PLAYER;

		player.id = id;
		player.socket = connection.socket;
		player.ip = remoteAddress;
		
		return player;
	}
}