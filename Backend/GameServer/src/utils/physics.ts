import { GAME_SIZE, IBall, IPaddle } from "../config/pongData";

/************************************************************************************************************/

export { isBallHittingPaddle, isBallHittingWall, isBallOutOfBounds, isNewPaddPosHittingMapLimit,
	adjustBallHorizontalPos, adjustBallVerticalPos, normalizeVector, scaleVelocity, processRobotOpponent
}

/************************************************************************************************************
 * 		Collision detection										 											*
 ***********************************************************************************************************/

function isBallHittingPaddle(ball: IBall, paddle: IPaddle): boolean
{
	const paddTopEdge: number = paddle.pos.z + (GAME_SIZE.PADD_WIDTH / 2);
	const paddDownEdge: number = paddle.pos.z - (GAME_SIZE.PADD_WIDTH / 2);
	const ballLeftEdge: number = ball.posistion.x - GAME_SIZE.BALL_RADIUS;
	const ballRightEdge: number = ball.posistion.x + GAME_SIZE.BALL_RADIUS;
	const ballTopEdge: number = ball.posistion.z + GAME_SIZE.BALL_RADIUS;
	const ballDownEdge: number = ball.posistion.z - GAME_SIZE.BALL_RADIUS;

	//	Check if the ball hits the paddle front (X-axis)
	if (paddle.side === 'right' && ballRightEdge <= paddle.pos.x - (GAME_SIZE.PADD_DEPTH / 2))
		return false;
	else if (ballLeftEdge >= paddle.pos.x + (GAME_SIZE.PADD_DEPTH / 2))
		return false;

	//	Check if the ball fits in the paddle's coordinates range (Z-axis)
	if (ballTopEdge <= paddTopEdge + (GAME_SIZE.BALL_RADIUS * 2) && ballDownEdge >= paddDownEdge - (GAME_SIZE.BALL_RADIUS * 2))
		return true;

	return false;
}

function isBallHittingWall(ball: IBall): boolean
{
	const ballDownEdge: number = ball.posistion.z - GAME_SIZE.BALL_RADIUS;
	const ballTopEdge: number = ball.posistion.z + GAME_SIZE.BALL_RADIUS;
	const mapLimit: number = GAME_SIZE.MAP_HEIGHT / 2;

	if (ballDownEdge <= -(mapLimit) || ballTopEdge >= mapLimit)
		return true;
	return false;
}

function isBallOutOfBounds(ball: IBall): boolean
{
	const ballLeftEdge: number = ball.posistion.x - GAME_SIZE.BALL_RADIUS;
	const ballRightEdge: number = ball.posistion.x + GAME_SIZE.BALL_RADIUS;
	const mapLimit: number = (GAME_SIZE.MAP_WIDTH / 2);

	// if (mapLimit - ballRightEdge < 0.50)
	// 	console.log(`left edge : ${ballLeftEdge} // right edge : ${ballRightEdge} // map limit : ${mapLimit}`);
	if (ballLeftEdge < -(mapLimit) || ballRightEdge > mapLimit)
		return true;
	return false;
}

function isNewPaddPosHittingMapLimit(paddCenterpos: number, velocityStep: number, input: string): boolean
{
	const mapLimit: number = GAME_SIZE.MAP_HEIGHT / 2;
	let newPaddPos: number;

	switch (input)
	{
		case 'up':
			newPaddPos = paddCenterpos + (GAME_SIZE.PADD_WIDTH / 2) + velocityStep;
			if (newPaddPos <= mapLimit)
				return false;
			return true;
		case 'down':
			newPaddPos = paddCenterpos - (GAME_SIZE.PADD_WIDTH / 2) - velocityStep;
			if (newPaddPos >= -mapLimit)
				return false;
			return true;
		default:
			return true;
	}
}

/************************************************************************************************************
 * 		Useful physics functions								 											*
 ***********************************************************************************************************/

function adjustBallHorizontalPos(ball: IBall): number
{
	if (ball.posistion.x >= 0)
	{
		const ballLeftEdge: number = ball.posistion.x - GAME_SIZE.BALL_RADIUS;
		return (ballLeftEdge - GAME_SIZE.BALL_RADIUS - 0.001);
	}
	const ballRightEdge: number = ball.posistion.x + GAME_SIZE.BALL_RADIUS;
	return (ballRightEdge + GAME_SIZE.BALL_RADIUS - 0.0001);
}

function adjustBallVerticalPos(ball: IBall)
{
	const mapLimit: number = GAME_SIZE.MAP_HEIGHT / 2;
	if (ball.posistion.z >= 0)
		return (mapLimit - GAME_SIZE.BALL_RADIUS - 0.001);
	return (-(mapLimit) + GAME_SIZE.BALL_RADIUS - 0.0001);
}


function normalizeVector(v: { x: number, z: number }): { x: number, z: number }
{
	const length = Math.sqrt(v.x * v.x + v.z * v.z);

	if (length === 0)
		return v;

	return { x: v.x / length, z: v.z / length };
}

function scaleVelocity(ball: IBall, deltaTime: number): { x: number, z: number }
{
	const scalar = ball.speed * deltaTime;
	const velocity = {
		x: ball.direction.x * scalar,
		z: ball.direction.z * scalar
	}
	return velocity;
}

function processRobotOpponent(paddle: IPaddle, ball: IBall, probability: number): string
{
	const result = Math.floor(Math.random() * probability);
	//	Avoid the robot to always move perfectly : 1/BOT_PROBABILITY chance to miss the target
	if (result !== 1) return 'none';
	
	//	Reduces noise & vibration (avoid robot constantly moving when it's uncessary)
	if (ball.posistion.x >= 0) return 'none';
	else if (ball.posistion.z === paddle.pos.z) return 'none';

	const halfPaddLength: number = GAME_SIZE.PADD_WIDTH / 2;

	//	No move needed if the ball is already in the paddle's field
	if (ball.posistion.z <= paddle.pos.z + halfPaddLength && ball.posistion.z >= paddle.pos.z - halfPaddLength)
		return 'none';

	//	Process automatic move
	if (ball.posistion.z > paddle.pos.z)
		return 'up';
	else
		return 'down';
}