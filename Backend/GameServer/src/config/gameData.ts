export { GameType, GameLocation, IBall, IPaddle, IPlayer }

/************************************************************************************************************
 * 		Declare CONSTANT variables								 											*
 ***********************************************************************************************************/

/************************************************************************************************************
 * 		Declare enums																						*
 ***********************************************************************************************************/

enum GameType {
	solo, duo, tournament 
};

enum GameLocation {
	local, remote
};

/************************************************************************************************************
 * 		Declare interfaces																					*
 ***********************************************************************************************************/

interface IBall {
	x: number;
	z: number;
	speed: number;
	direction: number;
};

interface IPaddle {
	z: number;
	side: number;
	robot: boolean;
};

interface IPlayer {
	id: number;
	gameType: GameType,
	socket?: WebSocket
	isReady: boolean,
	ip?: string,
	score: number,
	roomId?: number,
	color?: string;
};

