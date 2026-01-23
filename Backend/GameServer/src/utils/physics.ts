import { time } from "node:console";
import { GAME_SIZE, IBall, IPaddle, IRobot } from "../config/pongData";

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

function processRobotOpponent(
	paddle: IPaddle, ball: IBall, robotState: IRobot, currentTime: number): void
{
	//	The AI must only refresh its view & take decisions once per second otherwise continue the last move
	if (currentTime - robotState.lastViewRefresh < 1000) {
		return ;
	}

	console.log(robotState);
	robotState.lastViewRefresh = currentTime;

	//	Avoid the robot to always move perfectly : 1/PROBABILITY chance to miss the target
	const result = Math.floor(Math.random() * robotState.successProba);
	if (result === 0) {
		robotState.currentMove = 'none';
		return ;
	}
	
	robotState.targetPosition = predictBallPos(ball);

	const distanceToTarget: number = robotState.targetPosition - paddle.pos.z;
	const halfPaddLength: number = GAME_SIZE.PADD_WIDTH / 2;

	console.log(`target ${robotState.targetPosition} distance ${distanceToTarget} padd pos ${paddle.pos.z}`);
	//	Reduce noise & vibration (avoid robot constantly moving when it's uncessary)
	if (Math.abs(distanceToTarget) < halfPaddLength * 0.3) {
		robotState.currentMove = 'none';
		return ;
	}

	//	Process automatic move
	if (distanceToTarget > 0) {
		robotState.currentMove = 'up';
		return ;
	}
	else {
		robotState.currentMove = 'down';
		return ;
	}
}

/**
 * 	- Anticipation of the next ball position that becomes the target of the robot
 */
function predictBallPos(ball: IBall): number
{
	// console.log('=== PREDICT BALL ===');
    // console.log('Ball position:', ball.posistion);
    // console.log('Ball direction:', ball.direction);
    // console.log('Ball speed:', ball.speed);
	//	Come back to the center when the ball moves away
	if (ball.direction.x >= 0)
		return 0;

	console.log('Ball moving TOWARDS paddle, predicting...');

	const topMap: number = GAME_SIZE.MAP_HEIGHT / 2;
	const bottomMap: number = -(GAME_SIZE.MAP_HEIGHT / 2);

	const deltaTime: number = 0.016;
	const timeLimit: number = 1.0;
	let elapsedTime: number = 0;
	const ballExpected: IBall = {
		speed: ball.speed,
		posistion: { x: ball.posistion.x, z: ball.posistion.z},
		direction: { x: ball.direction.x, z: ball.direction.z}
	};

	while (elapsedTime < timeLimit)
	{
		const velocity = scaleVelocity(ballExpected, deltaTime);
		ballExpected.posistion.x += velocity.x;
		ballExpected.posistion.z += velocity.z;

		if (ballExpected.posistion.x <= -(GAME_SIZE.MAP_WIDTH / 2))
			break ;

		//	Process new pos and dir if the ball hits the top or bottom of the map
		if (ballExpected.posistion.z > topMap)
		{
			ballExpected.posistion.z = topMap - (ballExpected.posistion.z - topMap);
			ballExpected.direction.z = -(ballExpected.direction.z);
		}
		else if (ballExpected.posistion.z < bottomMap)
		{
			ballExpected.posistion.z = bottomMap + (ballExpected.posistion.z - bottomMap);
			ballExpected.direction.z = -(ballExpected.direction.z);
		}

		elapsedTime += deltaTime;
	}

	console.log(`Predicted Z position: ${ballExpected.posistion.z} `);
    console.log('===================');

	return ballExpected.posistion.z;
}