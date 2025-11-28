import { Vector3 } from '@babylonjs/core';
import { createPaddle } from "./Graphics"
import { Ball } from "./Ball"

export class Paddle {
	static WIDTH = 1.25;
	static HEIGHT = 0.25;
	static DEPTH = 0.25;
	static SPEED = 15.0;
	static RESPONSIVENESS = -19.0

	constructor(scene, side, mapWidth) {
		this.mesh = createPaddle(scene);
		this.mesh.rotation.y = Math.PI / 2;
		this.mesh.position = new Vector3((mapWidth / 2), 0.2, 0.0);
		if (side === "left")
			this.mesh.position.x = -(mapWidth / 2);
	}

	move(direction, posLimit, lastFrameTime) {
		const meshTopPos = this.mesh.position.z + (Paddle.WIDTH / 2);
		const meshBottomPos = this.mesh.position.z - (Paddle.WIDTH / 2);
		const deltaTime = (Date.now() - lastFrameTime) / 1000;
        const alpha = 1 - Math.exp(Paddle.RESPONSIVENESS * deltaTime);
		//	Frame-rate independent smoothing
		const step = Paddle.SPEED * deltaTime * alpha;

		posLimit += 0.1;
		if (direction === "up" && (meshTopPos + step) <= posLimit)
			this.mesh.position.z += step;
		if (direction === "down" && (meshBottomPos - step) >= -posLimit)
			this.mesh.position.z -= step;
	}

	autoMove(ballPosZ, ballPosX, posLimit, lastFrameTime) {
		//	Avoid the robot to always move perfectly : 1/3 chance to miss the target
		if (Math.floor(Math.random() * 4) == 1) return ;
		if (ballPosZ == this.mesh.position.z) return ;
		if (ballPosX >= 0) return ;

		const padPosZ = this.mesh.position.z;
		const half = Paddle.WIDTH / 2;
		if (ballPosZ <= padPosZ + half && ballPosZ >= padPosZ - half) return ;
		if (ballPosZ > padPosZ)
			this.move("up", posLimit, lastFrameTime);
		else
			this.move("down", posLimit, lastFrameTime);
	}
}
