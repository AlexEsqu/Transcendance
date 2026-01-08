import { Scene, ArcRotateCamera, Mesh } from '@babylonjs/core';

/************************************************************************************************************/

export { GAME_SIZE, State }
export type { IPlayer, IPaddle, IOptions, IScene, IResult }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

const GAME_SIZE = {
	BALL_RADIUS: 0.15,

	PADD_WIDTH: 1.25,
	PADD_HEIGHT: 0.25,
	PADD_DEPTH: 0.25,

	MAP_WIDTH: 10,
	MAP_HEIGHT: 6,
	MAP_Y: 0.2
}

/************************************************************************************************************
 * 		Declare enums																						*
 ***********************************************************************************************************/

enum State {
	waiting, opening, launch, play, pause, end, stop
};

/************************************************************************************************************
 * 		Declare interfaces																					*
 ***********************************************************************************************************/

interface IOptions {
	matchLocation: string;	// 'local' or 'remote'
	level: number;
	nbOfPlayers: number; // 1, 2 or 4
	paddColors: string[];
	players: string[];
	ballColor: string;
	mapColor: string;
};

interface IPaddle {
	mesh: Mesh | null;
	player: IPlayer | null,
};

interface IScene {
	id: Scene | null;
	state: State;
	camera: ArcRotateCamera | null;
	ball: Mesh | null;
	leftPadd: IPaddle | null;
	rightPadd: IPaddle | null;
	options: IOptions;
	players: Array<IPlayer> | null;
};

interface IPlayer {
	id: number;
	name: string;
	score: number;
	color: string;
};

interface IResult {
	winner: IPlayer | null;
	maxScore: number;
	loser: IPlayer | null;
	minScore: number;
};
