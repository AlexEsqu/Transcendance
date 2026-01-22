#!/usr/bin/env node
/***********************************************************************************************************/
import { JSONRoomDemand, JSONRoomAccess } from '../src/config/schemas';

import WebSocket from 'ws';
import readline from 'readline';
import { resolve } from 'dns';

/************************************************************************************************************
 * 		Pong CLI Client - websocket connection with the game-server			 								*
 ***********************************************************************************************************/

interface GameState {
	roomId: number;
	state: number;
	timestamp: number;
	round: number;
	leftPadd: { username: string, pos: number, score: number, color?:string };
	rightPadd: { username: string, pos: number, score: number, color?:string };
	ball: { x: number, z: number };
	results?: { winner: string, loser: string };
}

class PongCLI
{
	private serverWaitingRoomUrl: string;
	private serverGamingRoomUrl: string;
	private waitingSocket: WebSocket | null = null;
	private gamingSocket: WebSocket | null = null;
	private roomId: number | undefined = undefined;
	private username: string | null = null;
	private matchType: string = 'solo';
	private level: number = 0;
	private isPlayerReady: boolean = false;
	private gameState: GameState | null = null;

	constructor(username: string, matchType: string, level: number)
	{
		this.username = username;
		this.serverWaitingRoomUrl = "ws://localhost:4001/room/waiting";
		this.serverGamingRoomUrl = "ws://localhost:4001/room/gaming";
		this.matchType = matchType;
		this.level = level;
	}

	goToWaitingRoom(token: string): Promise<number>
	{
		return new Promise((resolve, reject) => {
			this.waitingSocket = new WebSocket(`${this.serverWaitingRoomUrl}?token=${token}`);
			if (!this.waitingSocket) {
				reject(new Error("'waitingSocket' creation failed"));
				return ;
			}

			this.waitingSocket.onopen = (event) => {
				if (!this.waitingSocket) {
					reject(new Error("elements not found, can't go to waiting room"));
					return ;
				}

				console.log("CLI: connection with game-server");

				//	On socket creation send a demand to the server to add player in a waiting room
				const demand: JSONRoomDemand = {
					id: -1,
					username: this.username ?? 'CLI-Player',
					color: "#a2c2e8",
					matchType: this.matchType,
					location: 'local',
					level: this.level
				};

				//	Set a timeout to avoid waiting until eternity
				setTimeout(() => {
					if (this.roomId === undefined)
					{
						console.log("CLI: No players available to play with you");
						resolve(-1);
					}
				}, 600000);
			};

			//	Wait for the server to manage waiting rooms and assign current user to a gaming room
			this.waitingSocket.onmessage = (event) => {
				const serverMsg: JSONRoomAccess = JSON.parse(event.data.toString());
				console.log("CLI: received message from game-server = ", serverMsg);

				//	If game server sends a valid roomId and that no roomId was already settled save data and close websocket
				if (serverMsg.roomId !== undefined && this.roomId === undefined) {
					this.roomId = serverMsg.roomId;
					this.waitingSocket?.close();
					this.waitingSocket = null;
					//	We can leave waiting room
					resolve(this.roomId);
				}
			};

			this.waitingSocket.onerror = () => {
				this.waitingSocket?.close();
				this.waitingSocket = null;
				reject(new Error("Authentication failed or websocket rejected from the game-server"));
			};

			this.waitingSocket.onclose = (event) => {
				this.waitingSocket = null;
				if (event.code === 1006)
					reject(new Error("Authentication failed or websocket rejected from the game-server"));
				else
					console.log("CLI: You left the waiting room, websocket (for route 'waiting') is closed");
				resolve(this.roomId ?? -1);
			};
		});
	}

	goToGaminRoom(token: string)
	{
		this.gamingSocket = new WebSocket(`wss://localhost:4001${this.serverGamingRoomUrl}?token=${token}`);
		if (!this.gamingSocket)
			throw new Error("'gamingSocket' not found");

		this.gamingSocket.onopen = () => {
			if (this.roomId === undefined || !this.gamingSocket)
				throw new Error("'gamingSocket' or 'roomId' not found, can't continue");

			console.log(`CLI: joining the gaming room(${this.roomId})`);

			//	On socket creation send a message to the game-server to obtain the game info
			// this.sendUpdateToGameServer(this.username, 'none', this.isPlayerReady);
			//	Start to display (not playing) the game scene
			// this.pong.runGame();
		};
	}
}

async function main()
{
	//	args = [username] [password] [matchType] [level]
	const args: string[] = process.argv.slice(2);
	const username: string = args[0];
	const password: string = args[1];
	const matchType: string = args[2];
	let level: number = 0;
	if (args[3])
		level = parseInt(args[3]);

	// Generate user token
	// const token: string = generateTokenCli(username, password);
	try {
		const cli: PongCLI = new PongCLI(username, matchType, level);
		// const roomId: number = cli.goToWaitingRoom(token);
		// if (roomId !== -1)
		// 	cli.goToGaminRoom(token);
	} catch (error)
	{

	}
	
}