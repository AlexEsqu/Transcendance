import { GAME, IBall, IPaddle, IPlayer, MatchType } from '../config/pongData'

export { initBall, initPadd, initPlayers }

function initBall(): IBall
{
	const ball: IBall = {
		speed: GAME.BALL_START_SPEED,
		posistion: { x: 0.0, z: 0.0 },
		direction: { x: 0.5, z: 0.0 }
	}
	return ball;
}

function initPadd(matchType: MatchType, side: string): IPaddle
{
	let isRobot: boolean = false;
	if (matchType === MatchType.solo && side === 'left')
		isRobot = true;
	
	const posX: number = side === 'right' ? (GAME.MAP_WIDTH / 2) : -(GAME.MAP_WIDTH / 2);

	const paddle: IPaddle = {
		pos: { x: posX, z: 0.0 },
		side: side,
		robot: matchType === MatchType.solo ? true : false,
		score: 0,
		player: undefined
	}
	return paddle;
}

function initPlayers(players: Map<number, IPlayer>): Array<IPlayer>
{
	let playerTab: Array<IPlayer> = new Array<IPlayer>;

	for (const [key, value] of players)
		playerTab.push(value);
	return playerTab;
}
