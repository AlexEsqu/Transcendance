import { GameControl } from '../controllers/GameControl.js'
import { parseJSONMessage } from '../utils/parsing.js'
import { IPlayer } from '@/config/gameData';
// import { sendToClient } from '../utils/broadcast.js'

/***********************************************************************************************************/

export { handleMessage, handleDisconnection}

/************************************************************************************************************
 * 		Declare handlers for the 'waiting room'								 								*
 ***********************************************************************************************************/

function handleMessage(socket: WebSocket, message: Buffer, gameControl: GameControl): number
{
	console.log("GAME-SERVER: waitingRoom route -- handleMessage");

	//	Must parse the type of game (local, 1vs1 or tournament)
	const playerId: IPlayer = parseJSONMessage(message);

	// const playerId = GameControl.generatePlayerId(connection, remoteAddress, playerData);
	//	Add in game controller (manage waiting rooms and gaming rooms)
	// GameControl.addPlayerInWaitingRoom(playerId);

	//	Notify "in the waiting room"
	// sendToClient(connection.socket, {
	// 	message: 'Connected to Pong Game Server'
	// });

	// switch (message)
	// {
	// 	case 'ready':
	// 		// Save player as ready in the waiting room
	// 	// case ''
	// }
	return playerId.id;
}


function handleDisconnection(player)
{
	console.log("GAME-HANDLER: disconnection of client ", player.id);
}