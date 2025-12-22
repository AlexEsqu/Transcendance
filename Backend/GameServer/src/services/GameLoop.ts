import { BALL, PADDLE } from '../config/data.js'
import { STATE } from '../config/constant.js';

export class GameLoop
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