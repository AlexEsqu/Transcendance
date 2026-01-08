import { IPlayer, IResult } from './pongData';
import { JSONAwaitingAccess, JSONListUsers } from './submit.json';

/************************************************************************************************************/

export { getCanvasConfig, getPlayers, fillWaitingRoomRequest }

/************************************************************************************************************/

function getCanvasConfig(canvasId: string): HTMLCanvasElement
{
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	return canvas;
}

function getPlayers(inputs: string[], nbOfPlayers: number): Array<IPlayer> | null
{
	const appUsers: JSONListUsers | null = getListOfUsers();
	if (!appUsers) return null;

	let players: Array<IPlayer> = [];
	for (let i = 0; i < nbOfPlayers; i++)
	{
		if (inputs[i]) {
			const id: number = findPlayerId(inputs[i], appUsers);
			players.push({ id: id, name: inputs[i], score: 0, color: "#"} );
		}
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

function findPlayerId(username: string, userList: JSONListUsers): number
{
	for (const user of userList)
	{
		if (user.username === username)
			return user.id;
	}
	return -1;
}

function getListOfUsers(): JSONListUsers | null
{
	if (!import.meta.env.APP_SECRET_KEY) return null;

	const url: string = "https://localhost:8443/api/users";
	const headers = {
		'Content-Type': 'application/json',
		'accept': '*/*',
		'X-App-Secret': import.meta.env.APP_SECRET_KEY
	};
	const request = new Request(
		url,
		{
			method: 'GET',
			headers: new Headers(headers)
		}
	);

	fetch(request)
	.then(async (response) => {
		const body = await response.text();
		try {
			const users: JSONListUsers = JSON.parse(body);
			return users;
		} catch {
			console.log('server response (text):', body);
		}
		if (!response.ok) {
			console.error('HTTP error', response.status, response.statusText);
			return null;
		}
	})
	.catch((error) => {
		console.error('network/fetch error', error);
		return null;
	});
	return null;
}

function fillWaitingRoomRequest(matchLocation: string | undefined, 
									nbOfPlayers: number | undefined, 
									playerId: number): JSONAwaitingAccess
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
	const request: JSONAwaitingAccess = {
		id: playerId,
		match: match,
		location: location
	}
	return request;
}
