import { IBall, IPaddle, GameType } from '../config/gameData'
import { GameLoop } from '../services/GameLoop';

export { initBall, initPadd }

function initBall(): IBall
{
	const ball: IBall = {
		speed: GameLoop.BALL_START_SPEED,
		posX: 0.0,
		posZ: 0.0,
		dirX: 0.5,
		dirZ: 0.0
	}
	return ball;
}

function initPadd(gameType: GameType, side: string): IPaddle
{
	const paddle: IPaddle = {
		posZ: 0.0,
		side: side,
		robot: gameType === GameType.solo ? true : false
	}
	return paddle;
}