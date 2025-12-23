import { Room } from "../services/Room";

export { notifyPlayersInRoom }

function notifyPlayersInRoom(room: Room | undefined, message: string): void
{
	if (room === undefined || room.players.size <= 0) return ;
	
	room.players.forEach((key) => {
		if (key.socket.readyState === WebSocket.OPEN) {
			try {
				const data = JSON.stringify({ message: message });
				key.socket.send(data);
			}
			catch (error) {
				console.error(error);
			}
		}
	});
}