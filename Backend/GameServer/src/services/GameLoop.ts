import { IBall, IPaddle, IPlayer, State, Level } from '../config/gameData'

export class GameLoop
{
	static MAX_ROUNDS = 1;

	// ball: IBall;
	// leftPadd: IPaddle;
	// rightPadd: IPaddle;
	isLaunched: boolean;
	state: State;
	time: number;

	constructor()
	{
		this.isLaunched = false;
		this.state = State.opening;
		this.time = Date.now();
	}
}