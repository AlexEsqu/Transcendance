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
		if (side == "right")
			this.mesh.position.x = -5;
		else if (side == "left")
			this.mesh.position.x = 5;
		// Set a gizmo for debug
		// const gizmoManager = new GizmoManager(scene);
		// gizmoManager.positionGizmoEnabled = true;
		// gizmoManager.rotationGizmoEnabled = true;
		// gizmoManager.attachToMesh(this.mesh);
	}

	move(direction, posLimit) {
		const meshEdgePos = this.mesh.position.z + (this.meshSize.width / 2);
		const meshEdgeNeg = this.mesh.position.z - (this.meshSize.width / 2);
		if (direction == "up" && (meshEdgePos + paddSpeed) <= posLimit / 2)
			this.mesh.position.z += paddSpeed;
		else if (direction == "down" && (meshEdgeNeg - paddSpeed) >= -(posLimit / 2))
			this.mesh.position.z -= paddSpeed;
	}
}