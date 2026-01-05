import { IBall, IPaddle, GameType, IPlayer } from '../config/gameData'
import { GameLoop } from '../services/GameLoop';

export { initBall, initPadd, initPlayers }

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
		robot: gameType === GameType.solo ? true : false,
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
