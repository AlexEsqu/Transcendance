import { Scene, ArcRotateCamera, Mesh } from '@babylonjs/core';

export { State, Level }
export type { IPlayer, IPaddle, IOptions, IScene, IResult, JSONMatchesResults, JSONWaitingRoom, JSONRoomMessage, JSONGameState, JSONGameUpdate }

enum State {
	waiting, opening, launch, play, pause, end, stop
};

enum Level {
	easy, medium, hard
};

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

interface JSONMatchesResults {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
}

interface JSONWaitingRoom {
	id: number;
	match: string;
	location: string;
};

interface JSONRoomMessage {
	roomId: number;
	message: string;
};

interface JSONGameState {
	roomId: number;
	state: number;
	timestamp: number;
	round: number;
	leftPaddPos: number;
	rightPaddPos: number;
	ball: { x: number, z: number };
};

interface JSONGameUpdate {
	id?: number;
	roomId: number;
	ready: boolean;
	move?: string;
};