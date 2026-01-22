import { FastifyInstance } from "fastify";
import Ajv, { ValidateFunction } from 'ajv';
import { GameControl } from "../services/GameControl";
import { gameSchema } from '../config/schemas';
import { handleMessage, handleDisconnection } from '../handlers/game.handlers.js'
import { IPlayer, GAMING_ROOM_URL } from "../config/pongData";

/************************************************************************************************************
 * 		Declare routes/endpoints								 											*
 ***********************************************************************************************************/

// ROUTE DECLARATION : fastify.get('path', [options], () => { handler });

export async function registerGameRoutes(gameServer: FastifyInstance, gameControl: GameControl)
{
	const ajv = new Ajv() as Ajv;
	const validateGameMessage = ajv.compile(gameSchema) as ValidateFunction;

	await gameServer.register(async function (fastify) {
		fastify.get(GAMING_ROOM_URL, { websocket: true }, (socket, request) => {
			if (!socket) throw new Error("Websocket is missing");

			//	Handle: first connection of a client
			console.log("GAME-SERVER: new connection from a client on route '/room/game'");
			gameControl.saveClientSocket(socket);
			
			//	Handler: receiving message from a client
			socket.on('message', (message: Buffer) => {
				// console.log("GAME-SERVER: received a message from the client on route '/room/game'");
				handleMessage(socket, message, validateGameMessage, gameControl);
			});
	
			//	Handle: ending client connection properly for the server
			socket.on('close', () => {
				console.log("GAME-SERVER: closed connection from client on route '/room/game'");
				handleDisconnection(socket, gameControl);
			});
	
			//	Handle: errors!!
			socket.on('error', (error: Error) => {
				throw error;
			});
		});
	});
}