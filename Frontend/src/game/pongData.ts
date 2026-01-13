import { Scene, ArcRotateCamera, Mesh } from '@babylonjs/core';

/************************************************************************************************************/

export { GAME_SIZE, PlayerState, ServerState }
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

enum PlayerState {
	waiting, play, launch, end, pause, opening, stop
};

enum ServerState {
	waiting, play, launch, end
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
	state: PlayerState;
	camera: ArcRotateCamera | null;
	ball: Mesh | null;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	options: IOptions;
	players: Array<IPlayer>;
};

interface IPlayer {
	id: number;
	username: string;
	score: number;
	color: string;
};

interface IResult {
	winner: IPlayer | null;
	maxScore: number;
	loser: IPlayer | null;
	minScore: number;
};
