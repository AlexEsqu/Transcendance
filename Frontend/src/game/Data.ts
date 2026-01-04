import { Scene, ArcRotateCamera } from '@babylonjs/core';
import { Ball } from './Ball';
import { IPaddle } from './Pong';

export { State, Level }
export type {IPlayer, IRound, IOptions, IScene, IResult }

enum State {
	opening, launch, play, pause, end, stop
};

enum Level {
	easy, medium, hard
};

interface IOptions {
	matchType: string;	//	'local' or 'remote'
	level: number;
	nbOfPlayers: number; // 1, 2 or 4
	paddColors: string[];
	players: string[];
	// ballColor: string;
	// mapColor: string;
};

interface IScene {
	id: Scene | null;
	state: State;
	camera: ArcRotateCamera | null;
	ball: Ball | null;
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

interface IRound {
	results: Array<IResult> | null;
	nbOfRounds: number;
	playerIndex: number;
	nodeColor: string[];
}