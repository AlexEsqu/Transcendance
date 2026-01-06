import { WebSocket as WSWebSocket } from 'ws';

export { GAME, GameType, GameLocation, State, Level, IBall, IPaddle, IPlayer, IRound, IResult, IGameState }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

const GAME = {
	MAX_SCORE: 2,
	MAX_ROUNDS: 1,

	BALL_START_SPEED: 6,
	BALL_MAX_SPEED: 10,
	BALL_RADIUS: 0.15,

	PADD_RESPONSIVENESS: -25.0,
	PADD_SPEED: 25.0,
	PADD_WIDTH: 1.25,
	PADD_HEIGHT: 0.25,
	PADD_DEPTH: 0.25,

	MAP_WIDTH: 10,
	MAP_HEIGHT: 6
}

/************************************************************************************************************
 * 		Declare enums																						*
 ***********************************************************************************************************/

enum GameType {
	solo = 1, duo = 2, tournament = 4 
};

enum GameLocation {
	local, remote
};

enum State {
	opening, launch, play, pause, end, stop
};

enum Level {
	easy, medium, hard
};

/************************************************************************************************************
 * 		Declare interfaces																					*
 ***********************************************************************************************************/

interface IGameState {
	roomId: number;
	state: number;
	timestamp: number;
	round: number;
	leftPaddPos: number;
	rightPaddPos: number;
	ball: { x: number, z: number };
};

interface IBall {
	speed: number;
	posistion: { x: number, z: number };
	direction: { x: number, z: number };
};

interface IPaddle {
	pos: { x: number, z: number };
	side: string;
	robot: boolean;
	score: number;
	player: IPlayer | undefined;
};

interface IPlayer {
	id: number;
	socket: WSWebSocket;
	gameType: GameType;
	gameLocation: GameLocation;
	isReady: boolean;
	roomId?: number;
	color?: string;
};

interface IResult {
	winner: IPlayer | undefined;
	maxScore: number;
	loser: IPlayer | undefined;
	minScore: number;
};

interface IRound {
	results: Array<IResult> | null;
	waitingPlayers: Array<IPlayer>;
	nbOfRounds: number;
}