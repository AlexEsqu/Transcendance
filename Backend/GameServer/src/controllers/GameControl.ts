'use strict'

import { PLAYER } from '../config/data.js';
import { Room } from '../services/Room.js'

export class GameControl
{
	constructor()
	{
		this.waitingRoom = new Map<Room>(0);
		this.gamingRooms = new Map<Room>(0);
	}

	generatePlayerId(connection, id, type, remoteAddress)
	{
		let player = PLAYER;

		player.id = id;
		player.socket = connection.socket;
		player.ip = remoteAddress;
		player.type = type;
		
		return player;
	}

	addPlayerInWaitingRoom(player)
	{
		console.log("GAME-CONTROL : add a new player in a waiting room");
		//	Which type of game the player tries to join (local, duo or tournament)
		const gameType = player.type;

		//	add to an existing room that match with the type ?
		const roomId = this.findWaitingRoomMatch(gameType);
		if (roomId !== undefined)
			this.waitingRoom.get(roomId).addPlayerInRoom(player);
		else //	create a new waiting room and add the player in
			this.createWaitingRoom(player, type);

		//	is a waiting room full ? create a gamin room
		const fullWaitingRoomId = this.checkFullWaitingRoom();
		if (fullWaitingRoomId !== undefined)
			this.createGamingRoom(fullWaitingRoomId);
	}

	findWaitingRoomMatch(gameType)
	{
		this.waitingRoom.array.forEach((key, value) => {
			if (value.maxPlayers === gameType && value.players.size + 1 <= value.maxPlayers)
				return key;
		});
		console.log("GAME-CONTROL: no match with an exisiting free waiting room");
		return undefined;
	}

	createWaitingRoom(player, type)
	{
		const roomId = Date.now();
		if (!roomId) return false;

		const room = new Room(roomId, player, type);
		if (!room) return false;

		this.waitingRoom.set(roomId, room);
		console.log("GAME-CONTROL: new waiting room created ", roomId);
		return true;
	}

	checkFullWaitingRoom()
	{
		this.waitingRoom.array.forEach((key, value) => {
			if (value.players.size === value.maxPlayers)
				return key;
		});
		console.log("GAME-CONTROL: no full waiting room detected");
		return undefined;
	}

	createGamingRoom(roomId)
	{
		const room = this.waitingRoom.get(roomId);
		if (!room) {
			console.log("GAME-CONTROL: failed to create a new gaming room ", roomId);
			return false;
		}

		this.gamingRooms.set(roomId, room);
		this.waitingRoom.delete(roomId);
		console.log("GAME-CONTROL: new gaming room created ", roomId);
		return true;
	}
}