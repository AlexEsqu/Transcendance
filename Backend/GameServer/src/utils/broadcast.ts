import { JSONGameState, JSONRoomAccess } from "../config/schemas";
import { Room } from "../services/Room";

/************************************************************************************************************/

export { notifyPlayersInRoom }

/************************************************************************************************************/

function notifyPlayersInRoom(room: Room | undefined, message: string | JSONGameState | JSONRoomAccess): void
{
	if (room === undefined || room.players.size <= 0) return ;
	
	room.players.forEach((key) => {
		// if (key.socket.readyState === 1) {
		if (key.socket.readyState === WebSocket.OPEN) {
			try {
				const data = JSON.stringify(message);
				key.socket.send(data);
				// console.log("BROADCAST: ", message);
			}
			catch (error) {
				console.error(error);
			}
		}
	});
}