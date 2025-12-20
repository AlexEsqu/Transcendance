import { Scene, Vector3, Mesh } from '@babylonjs/core';
import { Paddle } from "./Paddle";
import { Pong, IPaddle } from "./Pong";
import { createBall } from './Graphics';
import { Level } from './Data';

export class Ball {
	static START_SPEED = 6;
	static MAX_SPEED = 10;
	static RADIUS = 0.15;

    mesh: Mesh | null;
    direction?: Vector3 | null;
    ball?: { minX: number; maxX: number; minZ: number; maxZ: number };
    speed?: number;

	constructor(scene: Scene, level: Level, color: string)
	{
		Ball.START_SPEED += level;
		Ball.MAX_SPEED += level;
		this.mesh = createBall(scene, Ball.RADIUS, color);
		if (!this.mesh) {
			console.error("'ball' mesh failed to be created");
			return ;
		}
		this.mesh.position = new Vector3(0.0, 0.2, 0.0);
		if (!this.mesh.position) {
			console.error("'ball' mesh's position Vector3 failed to be created");
			return ;
		}
		this.direction = new Vector3(0.5, 0.0, 0.0).normalize();
		if (!this.direction) {
			console.error("'ball' direction Vector3 failed to be created");
			return ;
		}
		this.ball = { minX: 0.0, maxX: 0.0, minZ: 0.0, maxZ: 0.0 };
		this.speed = Ball.START_SPEED;
	}

	/**
	 * 	- Move the ball according to its velocity
	 */
	move(lastFrameTime: number): void
	{
		if (!this.mesh || !this.direction || !this.speed) return ;

		const deltaTime: number = (Date.now() - lastFrameTime) / 1000;
		const velocity: Vector3 = this.direction.scale(this.speed * deltaTime);
		this.mesh.position.addInPlace(velocity);
	}

	/**
	 * 	- Update coordinates of the ball and check for collision.
	 * 	- Depending on what/where the ball hits an object or a limit, its direction is reversed and gain speed
	 */
	update(leftPadd: IPaddle | null, rightPadd: IPaddle | null): boolean
	{
		if (!this.direction || !this.mesh || !this.ball) return false;
		if (!leftPadd || !rightPadd || !leftPadd.paddle || !rightPadd.paddle || !leftPadd.player|| !rightPadd.player) return false;

		this.ball.minX = this.mesh.position.x - Ball.RADIUS;
		this.ball.maxX = this.mesh.position.x + Ball.RADIUS;
		this.ball.maxZ = this.mesh.position.z + Ball.RADIUS;
		this.ball.minZ = this.mesh.position.z - Ball.RADIUS;

		if (this.ball.maxX <= 0 && this.isBallHittingPadd(leftPadd.paddle, "left") === true)
			return false;
		else if (this.isBallHittingPadd(rightPadd.paddle, "right") == true)
			return false;

		const heightLimit: number = Pong.MAP_HEIGHT / 2;
		const widthLimit: number = Pong.MAP_WIDTH / 2;

		if (this.isBallHittingWall(this.ball.minZ, this.ball.maxZ, heightLimit) === true) {
			this.direction.z = -(this.direction.z);
			if (this.mesh.position.z >= 0)
				this.mesh.position.z = heightLimit - Ball.RADIUS  - 0.001;
			else
				this.mesh.position.z = -(heightLimit) + Ball.RADIUS  - 0.001;
		}
		if (this.isBallOutofBounds(this.ball.minX, this.ball.maxX, widthLimit) === true) {
			if (this.mesh.position.x > 0)
				leftPadd.player.score += 1;
			else
				rightPadd.player.score += 1;
			this.reset(false);
			return true;
		}
		return false;
	}

	/**
	 * 	- Check if coordinates of the ball hit the top or down of the map
	 */
	isBallHittingWall(minZ: number, maxZ: number, limit: number): boolean
	{
		if (minZ <= -(limit) || maxZ >= limit)
			return true;
		return false;
	}

	/**
	 * 	- Check if coordinates of the ball are out of the map limit
	 */
	isBallOutofBounds(minX: number, maxX: number, limit: number): boolean
	{
		if (minX < -(limit) || maxX > (limit))
			return true;
		return false;
	}

	/**
	 * 	- If the ball is hitting the paddle, invert its direction and return true,
	 * 		otherwise do nothing and return false.
	 */
	isBallHittingPadd(paddle: Paddle | null, side: string): boolean
	{
		if (!paddle || !paddle.mesh || side === undefined || !this.mesh || !this.ball || !this.direction || !this.speed) return false;

		const paddMaxZ: number = paddle.mesh.position.z + (Paddle.WIDTH / 2);
		const paddMinZ: number = paddle.mesh.position.z - (Paddle.WIDTH / 2);

		//	Check if the ball touches the paddle front (X-axis)
		if (side === "right" && this.ball.maxX <= paddle.mesh.position.x - (Paddle.DEPTH / 2))
			return false;
		else if (this.ball.minX >= paddle.mesh.position.x + (Paddle.DEPTH / 2))
			return false;

		//	Check if the ball fits in the paddle's coordinates range (Z-axis)
		if (this.ball.maxZ <= paddMaxZ + (Ball.RADIUS * 2) && this.ball.minZ >= paddMinZ - (Ball.RADIUS * 2)) {
			if (side === "right")
				this.mesh.position.x = this.ball.minX - Ball.RADIUS - 0.001;
			else
				this.mesh.position.x = this.ball.maxX + Ball.RADIUS - 0.001;
			//	Invert X direction
			this.direction.x = -(this.direction.x);
			this.direction.z = (this.mesh.position.z - paddle.mesh.position.z) / Paddle.WIDTH;
			this.direction.z *= 1.01;
			//	Avoiding repeating trajectories : randomize Z
			const zRandom = (Math.random() - 0.4) * 0.03;
			this.direction.z += zRandom;

			//	Sightly rendering : normalize direction
			this.direction.normalize();
			this.speed = Math.min(Ball.MAX_SPEED, this.speed * 1.05);
			return true;
		}
		return false;
	}

	/**
	 * Launch the ball in a random direction (X-axis)
	 */
	launch(): void
	{
		if (!this.direction) return ;

        this.speed = Ball.START_SPEED;
		if (Math.floor(Math.random() * 2) == 1)
			this.direction.x = 1;
		else
			this.direction.x = -1;
	}

	/**
	 * Reset position and direction
	 */
	reset(roundOpening: boolean): void
	{
		if (!this.mesh) return ;

		this.speed = Ball.START_SPEED;
		this.mesh.position.x = 0.0;
		if (roundOpening === true) this.mesh.position.z = 0.0;
	}
}
