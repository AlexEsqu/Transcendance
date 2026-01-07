import fastify, { FastifyInstance } from 'fastify';
import Ajv, { ValidateFunction } from 'ajv';
import { WebSocket as WSWebSocket } from 'ws';

import { handleMessage, handleDisconnection } from '../handlers/waitingRoom.handlers';
import { GameControl } from '../services/GameControl';
import { IPlayer, WAITING_ROOM_URL } from '../config/gameData';
import { waitingSchema } from '../config/schemas';

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerWaitingRoomRoutes(gameServer: FastifyInstance, gameControl: GameControl)
{
	const ajv = new Ajv() as Ajv;
	const validateWaitingMessage = ajv.compile(waitingSchema) as ValidateFunction;

	await gameServer.register(async function (fastify) {
		fastify.get(WAITING_ROOM_URL, { websocket: true }, (socket: WSWebSocket, request) => {
			if (!socket) throw new Error("Websocket is missing");

			let player = { playerId: -1, roomId: -1 };

			//	Handle: first connection of a client
			console.log("GAME-SERVER: new connection from a client on route '/room/waiting'");

			//	Handler: receiving message from a client
			socket.on('message', (message: Buffer) => {
				console.log("GAME-SERVER: received a message from the client on route '/room/waiting");
				player = handleMessage(socket, message, validateWaitingMessage, gameControl);
			});
	
			//	Handle: ending client connection properly for the server
			socket.on('close', () => {
				console.log("GAME-SERVER: client closed connection on route '/room/waiting");
				handleDisconnection(player, gameControl);
			});
	
			//	Handle: errors!!
			socket.on('error', (error: Error) => {
				console.error("WS-ERROR: ", error);
				throw new Error(error.toString());
			});
		});
	});
}