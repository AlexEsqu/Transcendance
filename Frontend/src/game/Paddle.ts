import { Vector3, Mesh, Scene } from '@babylonjs/core';
import { Ball } from "./Ball";
import { Level } from './pongData';

export class Paddle {
	static WIDTH = 1.25;
	static HEIGHT = 0.25;
	static DEPTH = 0.25;
	static SPEED = 25.0;
	static RESPONSIVENESS = -25.0;
	static BOT_PROBABILITY = 4;

	mesh: Mesh | null;

	constructor(scene: Scene, side: string, mapWidth: number, level: Level, colorHex: string)
	{
		Paddle.BOT_PROBABILITY -= level;
		this.mesh = createPaddle(scene, Paddle.HEIGHT, Paddle.WIDTH, Paddle.DEPTH, colorHex);
		if (!this.mesh) return ;
		this.mesh.rotation.y = Math.PI / 2;
		this.resetPosition(mapWidth, side);
	}

	/**
	 * 	- Update position in up direction or down, respect map and ball collisions
	 */
	move(direction: string, posLimit: number, lastFrameTime: number): void
	{
		if (!this.mesh) return ;

		const meshTopPos: number = this.mesh.position.z + (Paddle.WIDTH / 2);
		const meshBottomPos: number = this.mesh.position.z - (Paddle.WIDTH / 2);

		const deltaTime: number = (Date.now() - lastFrameTime) / 1000;
		//	Frame-rate independent smoothing
        const alpha: number = 1 - Math.exp(Paddle.RESPONSIVENESS * deltaTime);
		const step: number = Paddle.SPEED * deltaTime * alpha;

		posLimit += 0.1;
		if (direction === "up" && (meshTopPos + step) <= posLimit)
			this.mesh.position.z += step;
		else if (direction === "down" && (meshBottomPos - step) >= -posLimit)
			this.mesh.position.z -= step;
	}

	/**
	 * 	- If no user is specified, the paddle is controlled by a robot and moves automatically.
	 * 	- Do not always move, robot's behave is randomized
	 */
	autoMove(ball: Ball, posLimit: number, lastFrameTime: number): void
	{
		if (!this.mesh || !ball || !ball.mesh) return ;

		//	Avoid the robot to always move perfectly : 1/BOT_PROBABILITY chance to miss the target
		if (Math.floor(Math.random() * Paddle.BOT_PROBABILITY) == 1) return ;

		const ballPosZ: number = ball.mesh.position.z;
		const ballPosX: number = ball.mesh.position.x;

		if (ballPosX >= 0) return ;
		if (ballPosZ == this.mesh.position.z) return ;

		const padPosZ: number = this.mesh.position.z;
		const half: number = Paddle.WIDTH / 2;

		if (ballPosZ <= padPosZ + half && ballPosZ >= padPosZ - half) return ;
		if (ballPosZ > padPosZ)
			this.move("up", posLimit, lastFrameTime);
		else
			this.move("down", posLimit, lastFrameTime);
	}

	resetPosition(mapWidth: number, side: string): void
	{
		if (!this.mesh) return ;

		this.mesh.position = new Vector3((mapWidth / 2), 0.2, 0.0);
		if (side === "left") this.mesh.position.x = -(mapWidth / 2);
	}
}
