import { WebSocket as WSWebSocket } from 'ws';

/************************************************************************************************************/

export { GAME, MatchType, GameLocation, State, Level, GAMING_ROOM_URL, WAITING_ROOM_URL, PlayerState }
export type { IBall, IPaddle, IPlayer, IRound, IResult }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

const GAME = {
	MAX_SCORE: 11,
	MAX_ROUNDS: 1,

	BALL_START_SPEED: 6,
	BALL_MAX_SPEED: 10,
	BALL_RADIUS: 0.15,

	BOT_PROBABILITY: 4,
	PADD_RESPONSIVENESS: -25.0,
	PADD_SPEED: 25.0,
	PADD_WIDTH: 1.25,
	PADD_HEIGHT: 0.25,
	PADD_DEPTH: 0.25,

	MAP_WIDTH: 10,
	MAP_HEIGHT: 6
}

const GAMING_ROOM_URL: string = "/room/gaming";
const WAITING_ROOM_URL: string = "/room/waiting";

/************************************************************************************************************
 * 		Declare enums																						*
 ***********************************************************************************************************/

enum MatchType {
	solo = 1, duo = 2, tournament = 4 
};

enum GameLocation {
	local, remote
};

enum PlayerState {
	waiting, play, launch, end, opening, stop
};

enum State {
	waiting, play, launch, end
};

enum Level {
	easy, medium, hard
};

/************************************************************************************************************
 * 		Declare interfaces																					*
 ***********************************************************************************************************/

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
	username: string;
	socket: WSWebSocket;
	matchType: MatchType;
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