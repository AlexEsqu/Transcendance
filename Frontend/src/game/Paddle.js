import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, GizmoManager, HemisphericLight } from '@babylonjs/core';

const paddSpeed = 0.111;

export class Paddle {
	constructor(scene, player, side) {
		this.scene = scene;
		this.name = player;
		this.meshSize = { width: 2, height: 0.2, depth: 0.5 };
		this.mesh = MeshBuilder.CreateBox(
			'paddle',
			{
				width: this.meshSize.width,
				height: this.meshSize.height,
				depth: this.meshSize.depth
			},
			scene
		);
		this.mesh.rotation.y = Math.PI / 2;
		this.mesh.position.y = 0.1;
		if (side === "left")
			this.mesh.position.x = -5;
		else if (side === "right")
			this.mesh.position.x = 5;
	}

	move(direction, posLimit) {
		const meshTopPos = this.mesh.position.z + (this.meshSize.width / 2);
		const meshBottomPos = this.mesh.position.z - (this.meshSize.width / 2);

		if (direction === "up" && (meshTopPos + paddSpeed) <= posLimit)
			this.mesh.position.z += paddSpeed;
		else if (direction === "down" && (meshBottomPos - paddSpeed) >= -posLimit)
			this.mesh.position.z -= paddSpeed;
	}
}
