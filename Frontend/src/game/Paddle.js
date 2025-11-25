import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, GizmoManager, HemisphericLight } from '@babylonjs/core';

export class Paddle {
	static WIDTH = 2.0;
	static HEIGHT = 0.2;
	static DEPTH = 0.5;
	static SPEED = 0.111;

	constructor(scene, player, side, gameWidth) {
		this.scene = scene;
		this.name = player;
		// this.size = { width: 2, height: 0.2, depth: 0.5 };
		this.mesh = MeshBuilder.CreateBox(
			'paddle',
			{
				width: Paddle.WIDTH,
				height: Paddle.HEIGHT,
				depth: Paddle.DEPTH
			},
			scene
		);
		this.mesh.rotation.y = Math.PI / 2;
		this.mesh.position.y = 0.1;
		if (side === "left")
			this.mesh.position.x = -(gameWidth / 2);
		else if (side === "right")
			this.mesh.position.x = gameWidth / 2;
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