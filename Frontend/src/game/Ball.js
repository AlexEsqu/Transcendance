import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Scene, MeshBuilder, Vector3 } from '@babylonjs/core';
import { Paddle } from "./Paddle";
import { Pong } from "./Pong";

export class Ball {
	static START_SPEED = 0.05;
	static MAX_SPEED = 0.1;
	static RADIUS = 0.25;
	static Y = 0.3;

	constructor(scene) {
		this.scene = scene;
		this.mesh = MeshBuilder.CreateSphere('ball', { diameter: Ball.RADIUS * 2 }, scene);
		this.mesh.position = new Vector3(0.0, Ball.Y, 0.0);
		this.velocity = new Vector3(0.0, 0.0, 0.0);
		this.ball = { minX: 0.0, maxX: 0.0, minZ: 0.0, maxZ: 0.0 };
		this.speed = Ball.START_SPEED;
	}

	move() {
		this.mesh.position.x += this.velocity.x;
		this.mesh.position.z += this.velocity.z;
	}

	update(player1, player2) {
		if (player1 === undefined || player2 === undefined)
			return ;

		this.move();

		this.ball.minX = this.mesh.position.x - Ball.RADIUS;
		this.ball.maxX = this.mesh.position.x + Ball.RADIUS;
		this.ball.maxZ = this.mesh.position.z + Ball.RADIUS;
		this.ball.minZ = this.mesh.position.z - Ball.RADIUS;

		if (this.ball.maxX <= 0 && this.isBallHittingPadd(player1, "left") === true)
			return ;
		else if (this.isBallHittingPadd(player2, "right") == true)
			return ;

		const heightLimit = Pong.MAP_HEIGHT / 2;
		const widthLimit = Pong.MAP_WIDTH / 2;

		if (this.isBallHittingWall(this.ball.minZ, this.ball.maxZ, heightLimit) === true)
			this.velocity.z = -(this.velocity.z);
		if (this.isBallOutofBounds(this.ball.minX, this.ball.maxX, widthLimit) === true) {
			if (this.mesh.position.x < 0) {
				player2.score += 1;
				// console.log("Game STATE: +1 point for " + player2.name);
			} else {
				player1.score += 1;
				// console.log("Game STATE: +1 point for " + player1.name);
			}
			this.reset();
		}
	}

	isBallHittingWall(minZ, maxZ, limit) {
		if (minZ <= -(limit) || maxZ >= limit)
			return true;
		return false;
	}

	isBallOutofBounds(minX, maxX, limit) {
		if (minX < -(limit) || maxX > (limit))
			return true;
		return false;
	}

	isBallHittingPadd(player, side) {
		const paddle = player.paddle;
		if (!paddle || !paddle.mesh || side == undefined) return false;

		const paddMaxZ = paddle.mesh.position.z + (Paddle.WIDTH / 2);
		const paddMinZ = paddle.mesh.position.z - (Paddle.WIDTH / 2);
		
		//	Check if the ball touches the paddle edge
		if (side === "right" && this.ball.maxX <= paddle.mesh.position.x - (Paddle.DEPTH / 2))
			return false;
		else if (this.ball.minX >= paddle.mesh.position.x + (Paddle.DEPTH / 2))
			return false;

		//	Check if the ball fits in the paddle position (Z-axis) range
		if (this.ball.maxZ < paddMaxZ && this.ball.minZ > paddMinZ) {
			//	Invert X direction
			this.velocity.x = -(this.velocity.x);
			if (side === "right")
				this.mesh.position.x = this.ball.minX - Ball.RADIUS - 0.001;
			else
				this.mesh.position.x = this.ball.maxX + Ball.RADIUS - 0.001;
			//	Avoiding repeating trajectories : randomize Z
			const zRandom = (Math.random() - 0.4) * 0.02;
			this.velocity.z += zRandom;
			// this.velocity.z = -(this.velocity.z);
			//	Sightly rendering : normalize velocity
			const direction = this.velocity.normalize();
			this.speed = Math.min(Ball.MAX_SPEED, this.speed * 1.05);
			this.velocity = direction.scale(this.speed);

			return true;
		}
		return false;
	}
	
	/**
	 * Launch the ball in a random direction 
	 */
	launch() {
		if (Math.round(Math.random()) == 1)
			this.velocity.x = 1;
		else
			this.velocity.x = -1;
		if (Math.round(Math.random()) == 1)
			this.velocity.z = 1;
		else
			this.velocity.z = -1;
		const direction = this.velocity.normalize();
		this.speed = Math.min(Ball.MAX_SPEED, this.speed * 1.05);
		this.velocity = direction.scale(this.speed);
	}

	/**
	 * Reset position and velocity
	 */
	reset() {
		this.mesh.position.x = 0.0;
		this.mesh.position.z = 0.0;
		this.speed = Ball.START_SPEED;
		this.launch();
	}
}