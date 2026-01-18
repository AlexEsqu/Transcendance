import { JSONGameState, JSONRoomAccess } from "../config/schemas";
import { Room } from "../services/Room";

/************************************************************************************************************/

export { notifyPlayersInRoom }

/************************************************************************************************************/

function notifyPlayersInRoom(room: Room | undefined, message: string | JSONGameState | JSONRoomAccess): void
{
	if (room === undefined || room.players.size <= 0) return ;
	
	for (const [key, value] of room.players)
	{
		if (value.socket && value.socket.readyState === WebSocket.OPEN)
		{
			try {
				const data = JSON.stringify(message);
				value.socket.send(data);
				// console.log("BROADCAST: ", message);
			}
			catch (error) {
				console.error(error);
			}
		}
	}
}