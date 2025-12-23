import { GameLocation, GameType, IPlayer } from '../config/gameData';
import { WebSocket as WSWebSocket } from 'ws';
import { notifyPlayersInRoom } from '../utils/broadcast'
import { Room } from './Room';

export class GameControl
{
	waitingRoom: Map<number, Room>;
	gamingRooms: Map<number, Room>;

	constructor()
	{
		this.waitingRoom = new Map();
		this.gamingRooms = new Map();
	}

	generatePlayerId(socket: WSWebSocket, data: any)
	{
		const gameType: GameType = data.game === 'tournament' ? GameType.tournament: 
								data.game === 'duo' ? GameType.duo: GameType.solo;

		const gameLocation: GameLocation = data.location === 'local' ? GameLocation.local: GameLocation.remote;

		const player: IPlayer = {
			id: data.id,
			socket: socket,
			gameType: gameType,
			gameLocation: gameLocation,
			isReady: false,
			score: 0,
		};
		return player;
	}

	addPlayerInWaitingRoom(player: IPlayer)
	{
		console.log("GAME-CONTROL : add a new player in a waiting room");
		
		//	Add to an existing room that match with the gameType and gameLocation ?
		let roomId: number | undefined = this.findWaitingRoomMatch(player.gameType, player.gameLocation);
		if (roomId !== undefined)
			this.waitingRoom.get(roomId)?.addPlayerInRoom(player.id, player);
		else //	Or create a new waiting room and add the player in
			roomId = this.createWaitingRoom(player);

		//	Notify everyone in the waiting
		if (roomId !== undefined)
			notifyPlayersInRoom(this.waitingRoom.get(roomId), "new player added in the waiting room");

		//	Waiting room completed ? create a gaming room
		const fullWaitingRoomId: number | undefined = this.checkFullWaitingRoom();
		if (fullWaitingRoomId !== undefined)
			this.createGamingRoom(fullWaitingRoomId);
	}

	findWaitingRoomMatch(gameType: GameType, gameLocation: GameLocation): number | undefined
	{
		if (this.waitingRoom.size <= 0) return undefined;

		for (const [key, value] of this.waitingRoom) {
			if (value.type === gameType && value.players.size + 1 <= value.type)
				return key;
		}

		console.log("GAME-CONTROL: no match with an exisiting free waiting room");
		return undefined;
	}

	createWaitingRoom(player: IPlayer): number | undefined
	{
		const roomId = Date.now();
		if (!roomId) return undefined;

		const room = new Room(roomId, player, player.gameType);
		if (!room) return undefined;

		this.waitingRoom.set(roomId, room);
		console.log("GAME-CONTROL: new waiting room created ", roomId);
		return roomId;
	}

	checkFullWaitingRoom(): number | undefined
	{
		for (const [key, value] of this.waitingRoom) {
			if (value.players.size === value.type)
				return key;
		}
		console.log("GAME-CONTROL: no full waiting room detected");
		return undefined;
	}

	createGamingRoom(roomId: number): boolean
	{
		const room = this.waitingRoom.get(roomId);
		if (room === undefined) {
			console.log("GAME-CONTROL: failed to create a new gaming room ", roomId);
			return false;
		}

		this.gamingRooms.set(roomId, room);
		this.waitingRoom.delete(roomId);
		console.log("GAME-CONTROL: new gaming room created ", roomId);
		notifyPlayersInRoom(this.gamingRooms.get(roomId), "New gaiming room created and you're in");
		return true;
	}
}