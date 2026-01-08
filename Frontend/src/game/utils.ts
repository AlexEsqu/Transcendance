import { IPlayer, JSONWaitingRoom } from "./pongData";

export function getCanvasConfig(canvasId: string): HTMLCanvasElement
{
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas;
}

export function getPlayers(inputs: string[], nbOfPlayers: number): Array<IPlayer> | null
{
	let players: Array<IPlayer> = [];
	for (let i = 0; i < nbOfPlayers; i++)
	{
		if (inputs[i])
			players.push({ id: 0, name: inputs[i], score: 0, color: "#"} );
	}

	if (players.length != nbOfPlayers) {
		console.error("players initialization failed, some players are missing");
		return null;
	}

	// special case: opponent is a robot
	if (nbOfPlayers === 1) { 
		players.push({ id: 0, name: "Robot", score: 0, color: "#8dbcff" });
		players.reverse();
	}
	return players;
}

export function fillWaitingRoomRequest(matchLocation: string | undefined, 
									nbOfPlayers: number | undefined, 
									id: number | undefined): JSONWaitingRoom
{
	let match: string;
	switch(nbOfPlayers)
	{
		case 1:
			match = 'solo'
			break ;
		case 2:
			match = 'duo';
			break ;
		case 4: 
			match = 'tournament';
			break ;
		default:
			match = 'solo';
			break ;
	}

	let location: string = matchLocation ?? 'local';
	const request: JSONWaitingRoom = {
		id: id ?? Date.now(),
		match: match,
		location: location
	}
	return request;
}