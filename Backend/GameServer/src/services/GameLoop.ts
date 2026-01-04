import { IBall, IPaddle, IPlayer, State, Level, GameType } from '../config/gameData'
import { initBall, initPadd } from '../utils/init'

export class GameLoop
{
	static MAX_ROUNDS = 1;
	static BALL_START_SPEED = 6;
	static BALL_MAX_SPEED = 10;
	static BALL_RADIUS = 0.15;

	ball: IBall;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	state: State;
	isLaunched: boolean;
	time: number;

	constructor(gameType: GameType)
	{
		this.ball = initBall();
		this.leftPadd = initPadd(gameType, 'left');
		this.rightPadd = initPadd(gameType, 'right');
		this.state = State.opening;
		this.isLaunched = false;
		this.time = -1;
	}

	runGame(): void
	{
		//	update data
		//	check collisions
		//	monitor score/rounds
		//	broadcast to players
	}
}