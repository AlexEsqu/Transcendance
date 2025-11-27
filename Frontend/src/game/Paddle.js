import { createPaddle } from "./Graphics"

export class Paddle {
	static WIDTH = 2.0;
	static HEIGHT = 0.2;
	static DEPTH = 0.5;
	static SPEED = 0.15;

	constructor(scene, side, mapWidth) {
		this.mesh = createPaddle(scene);
		this.mesh.rotation.y = Math.PI / 2;
		this.mesh.position.y = 0.1;
		if (side === "left")
			this.mesh.position.x = -(mapWidth / 2);
		else if (side === "right")
			this.mesh.position.x = mapWidth / 2;
	}

	move(direction, posLimit) {
		const meshTopPos = this.mesh.position.z + (Paddle.WIDTH / 2);
		const meshBottomPos = this.mesh.position.z - (Paddle.WIDTH / 2);

		if (direction === "up" && (meshTopPos + Paddle.SPEED) <= posLimit)
			this.mesh.position.z += Paddle.SPEED;
		else if (direction === "down" && (meshBottomPos - Paddle.SPEED) >= -posLimit)
			this.mesh.position.z -= Paddle.SPEED;
	}
}
