import { Scene, ArcRotateCamera } from '@babylonjs/core';
import { Ball } from './Ball';
import { IPaddle } from './Pong';

export { State, Level }
export type {IPlayer, IRound, IOptions, IScene, IResult }

enum State {
	opening, launch, play, pause, end
};

interface IOptions {
	level: Level;
	nbOfPlayers: number;
	ballColor: string;
	paddColor: string;
	mapColor: string;
	players: string[];
};

interface IScene {
	id: Scene;
	state: State;
	camera: ArcRotateCamera;
	ball: Ball;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	options: IOptions;
	players: Array<IPlayer>;
};

interface IPlayer {
	id: number;
	name: string;
	score: number;
};

interface IResult {
	winner: IPlayer;
	maxScore: number;
	loser: IPlayer;
	minScore: number;
};

interface IRound {
	results: Array<IResult>,
	nbOfRounds: number,
	playerIndex: number
}

enum Level {
	easy, medium, hard
};
