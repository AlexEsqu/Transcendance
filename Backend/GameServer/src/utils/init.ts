import { GAME_SIZE, IBall, IPaddle, IPlayer, MatchType, Info } from '../config/pongData'

/************************************************************************************************************/

export { initBall, initPadd, initPlayers, initInfoByLevel }

/************************************************************************************************************/

function initBall(startSpeed: number): IBall
{
	const ball: IBall = {
		speed: startSpeed,
		posistion: { x: 0.0, z: 0.0 },
		direction: { x: 0.0, z: 0.0 }
	}
	return ball;
}

function initPadd(matchType: MatchType, side: string): IPaddle
{
	let isRobot: boolean = false;
	if (matchType === MatchType.solo && side === 'left')
		isRobot = true;
	
	const posX: number = side === 'right' ? (GAME_SIZE.MAP_WIDTH / 2) : -(GAME_SIZE.MAP_WIDTH / 2);

	const paddle: IPaddle = {
		pos: { x: posX, z: 0.0 },
		side: side,
		robot: isRobot,
		score: 0,
		player: undefined
	}
	return paddle;
}

function initPlayers(players: Map<string, IPlayer>): Array<IPlayer>
{
	let playerTab: Array<IPlayer> = new Array<IPlayer>;

	for (const [key, value] of players)
		playerTab.push(value);
	return playerTab;
}


function initInfoByLevel(level: number, matchType: MatchType): Info
{
	const INFO: Info = {
		MAX_SCORE: 11,
		MAX_ROUNDS: matchType === MatchType.tournament ? matchType - 1 : 1,
		BALL_START_SPEED: 3 + level,
		BALL_MAX_SPEED: 10 + level,
		PADD_SPEED: 20,
		PADD_RESPONSIVENESS: -60,
		BOT_PROBABILITY: 4 - level
	};
	return INFO;
}