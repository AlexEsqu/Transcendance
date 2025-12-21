import { BALL, PADDLE, STATE } from '../config/*'
// import { STATE } from '../config/constant';

export class gameLoop
{
	constructor()
	{
		this.ball = BALL;
		this.leftPadd = PADDLE;
		this.rightPadd = PADDLE;

		this.maxRounds = 1;

		this.isLaunched = false;
		this.state = STATE.init;
		this.time = Date.now();
	}
}