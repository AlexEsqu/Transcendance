// Contains every data about a paddle
// Handle position et movement, respects collision
// Handle input with keyboard

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, GizmoManager, HemisphericLight } from '@babylonjs/core';

const paddSpeed = 0.5;

export class Paddle {
	constructor(scene, player, left) {
		this.scene = scene;
		this.name = player;
		this.mesh = MeshBuilder.CreateBox(
			'paddle',
			{
				height: 0.2,
				width: 2,
				depth: 0.5
			},
			scene
		);
		this.mesh.rotation.y = Math.PI / 2;
		this.mesh.position.y = 0.1;
		if (left === true)
			this.mesh.position.x = -5;
		else
			this.mesh.position.x = 5;
		// Set a gizmo for debug
		// const gizmoManager = new GizmoManager(scene);
		// gizmoManager.positionGizmoEnabled = true;
		// gizmoManager.rotationGizmoEnabled = true;
		// gizmoManager.attachToMesh(this.mesh);
		// console.log(player);

	}

	move(direction, posLimit) {
		console.log(direction);
		console.log("posLimit Z " + posLimit);
		console.log("pos.z + speed " + (this.mesh.position.z + paddSpeed));
		console.log("pos.z - speed " + (this.mesh.position.z - paddSpeed));
		if (direction == "up" && (this.mesh.position.z + paddSpeed) <= posLimit)
			this.mesh.position.z += paddSpeed;
		else if (direction == "down" && (this.mesh.position.z - paddSpeed) <= posLimit)
			this.mesh.position.z -= paddSpeed;
	}
}