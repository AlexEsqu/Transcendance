import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';


// set lastHitPaddle
// Create material
// function to launch or stop the ball

export class Ball {
	constructor(scene) {
		this.scene = scene;
		this.meshSize = { radius: 0.5 };
		this.mesh = MeshBuilder.CreateSphere('ball', { diameter: this.meshSize.radius }, scene);
		this.mesh.position = new Vector3(0, 0.3, 0);
		this.velocity = { x: 0.1, z: 0.1};
	}

	update(lastFrameTime, groundSize, paddle) {
		// const deltaTime = (Date.now() - lastFrameTime) / 1000;
		// this.velocity.x += deltaTime;
		// this.velocity.z += deltaTime;
		const groundHeight = groundSize.height / 2;
		const groundWidth = groundSize.width / 2;
		const diam = this.meshSize.radius / 2;
		const posX = this.mesh.position.x;
		const posZ = this.mesh.position.z;
		if (posZ + diam >= groundHeight || posZ - diam <= -(groundHeight))
			this.velocity.z = -(this.velocity.z);
		if (posX + diam >= groundWidth || posX - diam <= -(groundWidth))
			this.velocity.x = -(this.velocity.x);

		this.mesh.position.x += this.velocity.x;
		this.mesh.position.z += this.velocity.z;
		
		// const paddleMiddle = paddle.position.z;
		// const paddleLeft;
		// const paddleRight;
		// check if paddle or empty
		// if (ballEdgeX)

	}

	/**
	 * Should launch in random direction from the middle of the ground
	 */
	launch() {
		// this.mesh.position.z += 0.5;
		// this.mesh.position.x += 0.5;
	}

	/**
	 * Reset position of the ball
	 */
	reset() {

	}

	/**
	 * There is 3 cases :
	 * 	- new pos is out of bounds = last hit paddle wins
	 * 	- new pos is in wall = invert direction according to velocity
	 * 	- new pos is in padlle = update last paddle hit and new dir
	 */
	checkForCollisions() {

	}
}