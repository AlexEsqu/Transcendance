import { GAME, IBall, IPaddle, GameType, IPlayer } from '../config/gameData'

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

function initPadd(gameType: GameType, side: string): IPaddle
{
	const posX: number = side === 'right' ? (GAME.MAP_WIDTH / 2) : -(GAME.MAP_WIDTH / 2);
	const paddle: IPaddle = {
		pos: { x: posX, z: 0.0 },
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
