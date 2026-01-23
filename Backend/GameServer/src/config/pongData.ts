import { WebSocket as WSWebSocket } from 'ws';

/************************************************************************************************************/

export { GAME_SIZE, MatchType, GameLocation, State, GameSatus, GAMING_ROOM_URL, WAITING_ROOM_URL }
export type { IBall, IPaddle, IPlayer, IRound, IResult, Info, IRobot }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

const GAME_SIZE = {
	
	BALL_RADIUS: 0.15,

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

enum State { // TO DO -- rename by LoopState
	waiting, play, end
};

enum GameSatus {
	ERROR = 0, SUCCESS
};

/************************************************************************************************************
 * 		Declare interfaces																					*
 ***********************************************************************************************************/

interface Info {
	MAX_SCORE: number;
	MAX_ROUNDS: number;
	BALL_START_SPEED: number;
	BALL_MAX_SPEED: number;
	PADD_SPEED: number;
	PADD_RESPONSIVENESS: number;
	BOT_PROBABILITY: number;
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
	username: string;
	socket: WSWebSocket | null;
	matchType: MatchType;
	gameLocation: GameLocation; // TO DO -- check if unused
	isReady: boolean;
	roomId?: number;
	color?: string;
	isCurrentlyPlaying: boolean;
};

interface IRobot {
	lastViewRefresh: number;
	currentMove: string;
	targetPosition: number;
	successProba: number;
};

interface IResult {
	winner: IPlayer;
	maxScore: number;
	loser: IPlayer;
	minScore: number;
};

interface IRound {
	results: Array<IResult> | null;
	waitingPlayers: Array<IPlayer>;
	nbOfRounds: number;
};
