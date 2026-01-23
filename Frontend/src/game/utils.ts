import { IOptions, IPlayer, PlayerState, ServerState } from './pongData';
import { JSONRoomDemand, JSONGameState } from './submit.json';
import { userState, } from "../app";

/************************************************************************************************************/

export { getCanvasConfig, getPlayers, fillRoomDemand, processNewPlayerState, assignPlayer, getIPlayerFromStr }

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
			if (matchLocation === 'local' && inputs[i] !== userState.getUser()?.getName())
				id = 0;
			else
				id = userState.getUser()?.getId() ?? 0;
			players.push({ id: id, username: inputs[i], score: 0, color: colors[i] } );
		}
	}

	// special case: opponent is a robot
	if (nbOfPlayers === 1)
		players.push({ id: 0, username: "Robot", score: 0, color: "#8dbcff" });

	return players;
}

function getIPlayerFromStr(players: string[]): IPlayer[]
{
	let newPlayerObject: IPlayer[] = [];
	for (let i = 0; i < players.length; i++)
	{
		const playerId: IPlayer = {
			id: -1,
			username: players[i],
			score: 0,
			color: "#8dbcff"
		}
		newPlayerObject.push(playerId);
	}
	return newPlayerObject;
}

function fillRoomDemand(options: IOptions, player: IPlayer): JSONRoomDemand
{
	let matchType: string;
	switch(options.nbOfPlayers)
	{
		case 1:
			matchType = 'solo'
			break ;
		case 2:
			matchType = 'duo';
			break ;
		case 4: 
			matchType = 'tournament';
			break ;
		default:
			matchType = 'duo';
			break ;
	}

	const request: JSONRoomDemand = {
		secret: import.meta.env.VITE_APP_SECRET_KEY ?? "",
		id: player.id,
		username: player.username,
		color: player.color,
		matchType: matchType,
		location: options.matchLocation ?? 'local',
		level: options.level
	}
	return request;
}

function processNewPlayerState(serverInput: number): PlayerState
{
	const serverState  = serverInput as ServerState;

	switch (serverState)
	{
		case ServerState.play:
			return PlayerState.play;

		case ServerState.waiting:
			return PlayerState.waiting;

		case ServerState.end:
			return PlayerState.end;

		default:
			return PlayerState.play;
	}
}

function findPlayer(players: IPlayer[], username: string): IPlayer | null
{
	for (const player of players)
	{
		if (player.username === username)
			return player;
	}
	return null;
}

function assignPlayer(gameState: JSONGameState, players: IPlayer[], side: string): IPlayer | null
{
	if (side === 'left')
		return findPlayer(players, gameState.leftPadd.username);
	else
		return findPlayer(players, gameState.rightPadd.username);
}