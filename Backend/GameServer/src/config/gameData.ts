import { WebSocket as WSWebSocket } from 'ws';

export { GameType, GameLocation, State, Level, IBall, IPaddle, IPlayer, IRound }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

/************************************************************************************************************
 * 		Declare enums																						*
 ***********************************************************************************************************/

enum GameType {
	solo = 1, duo, tournament 
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
};

interface IPlayer {
	id: number;
	socket: WSWebSocket;
	gameType: GameType;
	gameLocation: GameLocation;
	isReady: boolean;
	score: number;
	roomId?: number;
	color?: string;
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
}