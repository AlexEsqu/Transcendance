import { IPlayer } from './pongData';
import { JSONRoomDemand } from './submit.json';
import { userState, } from "../app";

/************************************************************************************************************/

export { getCanvasConfig, getPlayers, fillRoomDemand }

/************************************************************************************************************/

function getCanvasConfig(canvasId: string): HTMLCanvasElement
{
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas;
}

function getPlayers(inputs: string[], colors: string[], nbOfPlayers: number, matchLocation: string): Array<IPlayer> | null
{
	let players: Array<IPlayer> = [];
	for (let i = 0; i < inputs.length; i++)
	{
		if (inputs[i] && colors[i]) {
			let id;
			// console.log(`i = ${i} / loc = ${matchLocation} / name = ${inputs[i]} / storage = ${userState.getUser()?.getName()}`)
			if (matchLocation === 'local' && inputs[i] !== userState.getUser()?.getName())
				id = -1;
			else
				id = userState.getUser()?.getId() ?? -1;
			players.push({ id: id, username: inputs[i], score: 0, color: colors[i] } );
		}
	}

	// if (players.length != nbOfPlayers) {
	// 	console.error("players initialization failed, some players are missing");
	// 	return null;
	// }

	// special case: opponent is a robot
	if (nbOfPlayers === 1) { 
		players.push({ id: 0, username: "Robot", score: 0, color: "#8dbcff" });
		// players.reverse();
	}
	return players;
}

function fillRoomDemand(
	matchLocation: string | undefined, nbOfPlayers: number | undefined, player: IPlayer): JSONRoomDemand
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
	const request: JSONRoomDemand = {
		id: player.id,
		username: player.username,
		match: match,
		location: location
	}
	return request;
}
