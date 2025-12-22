export function parseMessage(message)
{
	try {
		const strMessage = message.toString();
		const data = JSON.parse(strMessage);
		return data;
	} catch (error) {
		console.error("GAME-SERVER: error while parsing websocket's message");
		return null;
	}
}