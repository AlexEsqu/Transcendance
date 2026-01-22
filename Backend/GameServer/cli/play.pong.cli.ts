#!/usr/bin/env node
/***********************************************************************************************************/

import WebSocket from 'ws';
import readline from 'readline';

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
	private gameServerUrl: string;
	private waitingSocket: WebSocket | null = null;
	private gamingSocket: WebSocket | null = null;
	private roomId: number | undefined = undefined;
	private username: string | null = null;
	private matchType: string = 'solo';
	private isReady: boolean = false;
	private gameState: GameState | null = null;

	constructor(url: string)
	{
		this.gameServerUrl = url;
	}

	// async goToWaitingRoom
	// {

	// }
}