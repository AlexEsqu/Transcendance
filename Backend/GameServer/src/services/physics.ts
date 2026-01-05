import { IBall } from "../config/gameData";

class GameSize
{
	static PADD_WIDTH = 1.25;
	static PADD_HEIGHT = 0.25;
	static PADD_DEPTH = 0.25;

	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
}

export function isNewPaddPosHittingMapLimit(paddCenterpos: number, velocityStep: number, input: string): boolean
{
	const mapLimit: number = GameSize.MAP_HEIGHT / 2;
	let newPaddPos: number;

	switch (input)
	{
		case 'up':
			newPaddPos = paddCenterpos + (GameSize.PADD_WIDTH / 2) + velocityStep;
			if (newPaddPos <= mapLimit)
				return false;
			return true;
		case 'down':
			newPaddPos = paddCenterpos - (GameSize.PADD_WIDTH / 2) - velocityStep;
			if (newPaddPos >= -mapLimit)
				return false;
			return true;
		default:
			return true;
	}
}

export function scaleVelocity(ball: IBall, deltaTime: number): { x: number, z: number }
{
	const velocity = {
		x: ball.dirX * (ball.speed * deltaTime),
		z: ball.dirZ * (ball.speed * deltaTime)
	}
	return velocity;
}