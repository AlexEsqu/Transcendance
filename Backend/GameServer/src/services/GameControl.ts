import { GameLocation, GameType, IPlayer } from '../config/gameData';
import { WebSocket as WSWebSocket } from 'ws';
import { notifyPlayersInRoom } from '../utils/broadcast'
import { Room } from './Room';
import { IGameMessage } from '../config/schemas';

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
			isReady: false
		};
		return player;
	}

	getPlayer(roomId: number, playerId: number): IPlayer | undefined
	{
		if (this.gamingRooms.has(roomId)) {
			const room = this.gamingRooms.get(roomId);
			if (room?.players.has(playerId))
				return room.players.get(playerId);
		}
		return undefined;
	}

	getGamingRoom(roomId: number): Room | undefined
	{
		if (this.gamingRooms.has(roomId))
			return this.gamingRooms.get(roomId);
	}

	addPlayerInWaitingRoom(player: IPlayer): number | undefined
	{
		console.log("GAME-CONTROL : add a new player in a waiting room");
		
		//	Add to an existing room that match with the gameType and gameLocation ?
		let roomId: number | undefined = this.findWaitingRoomMatch(player.gameType, player.gameLocation);
		if (roomId !== undefined)
			this.waitingRoom.get(roomId)?.addPlayerInRoom(player.id, player);
		else //	Or create a new waiting room and add the player in
			roomId = this.createWaitingRoom(player);

		//	Notify everyone in the waiting room
		if (roomId !== undefined)
			notifyPlayersInRoom(this.waitingRoom.get(roomId), "new player added in the waiting room");

		//	Waiting room completed ? create a gaming room
		const fullWaitingRoomId: number | undefined = this.checkFullWaitingRoom();
		if (fullWaitingRoomId !== undefined)
			this.createGamingRoom(fullWaitingRoomId);
		return roomId;
	}

	findWaitingRoomMatch(gameType: GameType, gameLocation: GameLocation): number | undefined
	{
		if (this.waitingRoom.size <= 0) return undefined;

		for (const [key, value] of this.waitingRoom) {
			if (value.type === gameType && value.players.size + 1 <= value.type)
				return key;
		}

		console.log("GAME-CONTROL: no match with an existing free waiting room");
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
		notifyPlayersInRoom(this.gamingRooms.get(roomId), "New gaming room created and you're in");
		return true;
	}

	deletePlayerFromRoom(playerId: number, roomId: number): void
	{
		let room: Room | undefined;
		if (this.waitingRoom.has(roomId)) {
			room = this.waitingRoom.get(roomId);
			console.log("GAME-SERVER: a player has left the waiting room");
			notifyPlayersInRoom(room, "A player has left the waiting room");
		}
		else if (this.gamingRooms.has(roomId)) {
			room = this.gamingRooms.get(roomId);
			console.log("GAME-SERVER: a player has left the gaming room");
			notifyPlayersInRoom(room, "A player has left the gaming room");
		}
		if (room && room.players.has(playerId))
			room.players.delete(playerId);
	}
}