export { PORT, HOST, BALL_INFO, PADDLE_INFO, GAME_INFO, STATE, LEVEL }

/*****************************************************************
 * 		Declare CONSTANT variables								 *
 *****************************************************************/

const PORT = process.env.PORT;
const HOST = process.env.ADDRESS;

/*****************************************************************
 * 		Declare CONSTANT info -> interfaces						 *
 *****************************************************************/

const BALL_INFO = {
	startSpeed: 6.0,
	maxSpeed: 10.0,
	radius: 0.15
};

const PADDLE_INFO = {
	width: 1.25,
	height: 0.25,
	depth: 0.25,
	speed: 25.0,
	responsiveness: -25.0,
};

const MAP_SIZE = {
	width: 10,
	height: 6,
};

const GAME_INFO = {
	maxScore: 2,
	map: MAP_SIZE
};

/*****************************************************************
 * 		Declare CONSTANT enums									 *
 *****************************************************************/

const STATE = {
	init: -1,
	opening: 0,
	launch: 1,
	play: 2,
	pause: 3,
	end: 4,
	stop: 5
};

const LEVEL = {
	easy: 0,
	medium: 1,
	hard: 2
};

