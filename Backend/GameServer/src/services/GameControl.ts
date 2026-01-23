import { GameLocation, MatchType, IPlayer } from '../config/pongData';
import websocket from '@fastify/websocket';
import { WebSocket as WSWebSocket } from 'ws';
import { notifyPlayersInRoom } from '../utils/broadcast'
import { Room } from './Room';
import { JSONRoomAccess, JSONRoomDemand } from '../config/schemas';

export class GameControl
{
	clientSockets: WSWebSocket[] | null;
	waitingRoom: Map<number, Room>;
	gamingRooms: Map<number, Room>;

	constructor()
	{
		this.clientSockets = null;
		this.waitingRoom = new Map();
		this.gamingRooms = new Map();
	}

	saveClientSocket(socket: WSWebSocket): void
	{
		if (this.clientSockets === null)
			this.clientSockets = [ socket ];
		else if (!this.clientSockets.includes(socket))
			this.clientSockets.push(socket);
	}

	findPlayerBySocket(socket: WSWebSocket): IPlayer | null
	{
		if (this.clientSockets === null)
			return null;

		for (const [key, value] of this.gamingRooms)
		{
			const room = value;
			for (const [key, value] of room.players)
			{
				if (value.socket && value.socket === socket) {
					console.log("GAME-CONTROL: match found between socket and saved players");
					return value;
				}
			}
		}
		return null;
	}

	generatePlayerId(socket: WSWebSocket, data: JSONRoomDemand)
	{
		const matchType: MatchType = data.matchType === 'tournament' ? MatchType.tournament: 
								data.matchType === 'duo' ? MatchType.duo: MatchType.solo;

		const gameLocation: GameLocation = data.location === 'local' ? GameLocation.local: GameLocation.remote;

		const player: IPlayer = {
			id: data.id,
			username: data.username,
			socket: socket,
			matchType: matchType,
			gameLocation: gameLocation,
			isReady: false,
			color: data.color,
			isCurrentlyPlaying: false
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

	addPlayerInWaitingRoom(player: IPlayer, matchLevel: number): number | undefined
	{
		console.log("GAME-CONTROL : add a new player in a waiting room");
		
		//	Add to an existing room that match with the matchType and gameLocation ?
		let roomId: number | undefined = this.findWaitingRoomMatch(player.matchType, player.gameLocation, matchLevel);
		if (roomId !== undefined)
			this.waitingRoom.get(roomId)?.addPlayerInRoom(player.username, player);
		else //	Or create a new waiting room and add the player in
			roomId = this.createWaitingRoom(player, matchLevel);

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

	findWaitingRoomMatch(matchType: MatchType, gameLocation: GameLocation, matchLevel: number): number | undefined
	{
		if (this.waitingRoom.size <= 0) return undefined;

		for (const [key, value] of this.waitingRoom)
		{
			if (value.type === matchType && value.level === matchLevel && gameLocation === value.location)
			{
				if (value.players.size + 1 <= value.type)
					return key;
			}
		}

		console.log("GAME-CONTROL: no match with an existing free waiting room");
		return undefined;
	}

	createWaitingRoom(player: IPlayer, matchLevel: number): number | undefined
	{
		const roomId = Date.now();
		if (!roomId) return undefined;

		const room = new Room(roomId, player, player.matchType, player.gameLocation, matchLevel);
		if (!room) return undefined;
		if (player.matchType === MatchType.solo)
		{
			const playerRobot: IPlayer = {
				id: 0,
				username: 'Robot',
				socket: player.socket,
				matchType: player.matchType,
				gameLocation: player.gameLocation,
				isReady: true,
				roomId: roomId,
				isCurrentlyPlaying: false
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
		const waitingRoom: Room | undefined = this.waitingRoom.get(roomId);
		if (waitingRoom === undefined) {
			console.log("GAME-CONTROL: failed to create a new gaming room n'", roomId);
			return false;
		}

		console.log("GAME-CONTROL: new gaming room created n'", roomId);
		// console.log("ROOOM ", this.gamingRooms.get(roomId)?.players);
		
		this.gamingRooms.set(roomId, waitingRoom);
		const current: Room | undefined = this.gamingRooms.get(roomId);
		if (current === undefined) {
			console.log("GAME-CONTROL: failed to create a new gaming room n'", roomId);
			return false;
		}
		current.createGameLoop();

		const welcomeMessage: JSONRoomAccess = {
			roomId: roomId,
			message: `Player ${player.username} has been added to gaming room n'${roomId}`,
			players: waitingRoom.getPlayersArray()
		};
		notifyPlayersInRoom(this.gamingRooms.get(roomId), welcomeMessage);

		this.waitingRoom.delete(roomId);

		return true;
	}

	deletePlayerFromRoom(username: string, roomId: number, roomType: string): void
	{
		let room: Room | undefined = undefined;

		switch (roomType)
		{
			case 'waiting':
				if (this.waitingRoom.has(roomId))
				{
					room = this.waitingRoom.get(roomId);
					console.log(`GAME-SERVER: a ${username} has left the waiting room`);
					notifyPlayersInRoom(room, `${username} has left the waiting room`);
				}
				break ;
			
			case 'game':
				if (this.gamingRooms.has(roomId))
				{
					room = this.gamingRooms.get(roomId);
					console.log(`GAME-SERVER: a ${username} has left the gaming room`);
					notifyPlayersInRoom(room, `${username} has left the gaming room`);
				}
				break ;
		}

		if (room !== undefined && room.players.has(username))
		{
			const player = room.players.get(username);
			if (player !== undefined && player.socket)
			{
				player.socket.close();
				player.socket = null;
			}
			room.players.delete(username);
			if (room.players.size <= 0)
				this.deleteRoom(roomId);
		}
	}

	deleteRoom(roomId: number): void
	{
		if (this.waitingRoom.has(roomId))
			this.waitingRoom.delete(roomId);
		else if (this.gamingRooms.has(roomId))
			this.gamingRooms.delete(roomId);
	}
}