import { WebSocket as WSWebSocket } from 'ws';

export { GameType, GameLocation, State, Level, IBall, IPaddle, IPlayer, IRound, IResult, IGameState }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

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
	posX: number;
	posZ: number;
	dirX: number;
	dirZ: number;
};

interface IPaddle {
	posZ: number;
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