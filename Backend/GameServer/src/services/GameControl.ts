import { GameLocation, MatchType, IPlayer, State } from '../config/pongData';
import { WebSocket as WSWebSocket } from 'ws';
import { notifyPlayersInRoom } from '../utils/broadcast'
import { Room } from './Room';
import { JSONRoomAccess, JSONRoomDemand } from '../config/schemas';

export class GameControl
{
	waitingRoom: Map<number, Room>;
	gamingRooms: Map<number, Room>;

	constructor()
	{
		this.waitingRoom = new Map();
		this.gamingRooms = new Map();
	}

	generatePlayerId(socket: WSWebSocket, data: JSONRoomDemand)
	{
		const matchType: MatchType = data.match === 'tournament' ? MatchType.tournament: 
								data.match === 'duo' ? MatchType.duo: MatchType.solo;

		const gameLocation: GameLocation = data.location === 'local' ? GameLocation.local: GameLocation.remote;

		const player: IPlayer = {
			id: data.id,
			username: data.username,
			socket: socket,
			matchType: matchType,
			gameLocation: gameLocation,
			isReady: false
		};
		return player;
	}

	getPlayer(roomId: number, player: string): IPlayer | undefined
	{
		if (this.gamingRooms.has(roomId)) {
			const room = this.gamingRooms.get(roomId);
			if (room?.players.has(player))
				return room.players.get(player);
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
		
		//	Add to an existing room that match with the matchType and gameLocation ?
		let roomId: number | undefined = this.findWaitingRoomMatch(player.matchType, player.gameLocation);
		if (roomId !== undefined)
			this.waitingRoom.get(roomId)?.addPlayerInRoom(player.username, player);
		else //	Or create a new waiting room and add the player in
			roomId = this.createWaitingRoom(player);

		//	Notify everyone in the waiting room
		if (roomId !== undefined)
			notifyPlayersInRoom(this.waitingRoom.get(roomId), `new player ${player.username} added in the waiting room n'${roomId}`);

		//	Waiting room completed ? create a gaming room
		let fullWaitingRoomId: number | undefined = this.checkFullWaitingRoom();
		while (fullWaitingRoomId !== undefined)
		{
			this.createGamingRoom(fullWaitingRoomId, player);
			fullWaitingRoomId = this.checkFullWaitingRoom();
		}
		return roomId;
	}

	findWaitingRoomMatch(matchType: MatchType, gameLocation: GameLocation): number | undefined
	{
		if (this.waitingRoom.size <= 0) return undefined;

		for (const [key, value] of this.waitingRoom) {
			if (value.type === matchType && value.players.size + 1 <= value.type && gameLocation === value.location)
				return key;
		}

		console.log("GAME-CONTROL: no match with an existing free waiting room");
		return undefined;
	}

	createWaitingRoom(player: IPlayer): number | undefined
	{
		const roomId = Date.now();
		if (!roomId) return undefined;

		const room = new Room(roomId, player, player.matchType, player.gameLocation);
		if (!room) return undefined;
		if (player.matchType === MatchType.solo) {
			const playerRobot: IPlayer = {
				id: 0,
				username: 'Robot',
				socket: player.socket,
				matchType: player.matchType,
				gameLocation: player.gameLocation,
				isReady: true,
				roomId: roomId
			};
			room.addPlayerInRoom('Robot', playerRobot);
		}

		this.waitingRoom.set(roomId, room);
		console.log("GAME-CONTROL: new waiting room created ", roomId);
		return roomId;
	}

	checkFullWaitingRoom(): number | undefined
	{
		for (const [key, value] of this.waitingRoom) {
			if (value.players.size === value.type || value.type === 1)
				return key;
		}
		console.log("GAME-CONTROL: no full waiting room detected");
		return undefined;
	}

	createGamingRoom(roomId: number, player: IPlayer): boolean
	{
		const room = this.waitingRoom.get(roomId);
		if (room === undefined) {
			console.log("GAME-CONTROL: failed to create a new gaming room n'", roomId);
			return false;
		}

		console.log("GAME-CONTROL: new gaming room created n'", roomId);
		// console.log("ROOOM ", this.gamingRooms.get(roomId)?.players);
		
		this.gamingRooms.set(roomId, room);

		const welcomeMessage: JSONRoomAccess = {
			roomId: roomId,
			message: `Player ${player.username} has been added to gaming room n'${roomId}`,
			players: room.getPlayersArray()
		};
		console.log(welcomeMessage);
		notifyPlayersInRoom(this.gamingRooms.get(roomId), welcomeMessage);

		this.waitingRoom.delete(roomId);

		return true;
	}

	deletePlayerFromRoom(player: string, roomId: number, roomType: string): void
	{
		let room: Room | undefined = undefined;

		switch (roomType)
		{
			case 'waiting':
				if (this.waitingRoom.has(roomId)) {
					room = this.waitingRoom.get(roomId);
					console.log("GAME-SERVER: a player has left the waiting room");
					notifyPlayersInRoom(room, "A player has left the waiting room");
				}
				break ;
			
			case 'game':
				if (this.gamingRooms.has(roomId)) {
					room = this.gamingRooms.get(roomId);
					console.log("GAME-SERVER: a player has left the gaming room");
					notifyPlayersInRoom(room, "A player has left the gaming room");
				}
				break ;
		}
		if (room !== undefined && room.players.has(player)) {
			room.players.delete(player);
			if (room.gameLoop)
				room.gameLoop.state = State.end;
		}
	}
}