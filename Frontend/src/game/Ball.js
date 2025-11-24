import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';
import { Paddle } from "./Paddle";

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

	update(lastFrameTime, groundSize, paddle1, paddle2) {
		// const deltaTime = (Date.now() - lastFrameTime) / 1000;
		// this.velocity.x += deltaTime;
		// this.velocity.z += deltaTime;
		const heightLimit = groundSize.height / 2;
		const widthLimit = groundSize.width / 2;
		const diam = this.meshSize.radius / 2;
		const posX = this.mesh.position.x;
		const posZ = this.mesh.position.z;
		let paddMinPosZ = 0;
		let paddMaxPosZ = 0;

		//	Check paddle collision
		if (posX <= 0) {
			paddMinPosZ = paddle1.mesh.position.z - (paddle1.meshSize.width / 2);
			paddMaxPosZ = paddle1.mesh.position.z + (paddle1.meshSize.width / 2);
		}
		else {
			paddMinPosZ = paddle2.mesh.position.z - (paddle2.meshSize.width / 2);
			paddMaxPosZ = paddle2.mesh.position.z + (paddle2.meshSize.width / 2);
		}
		//	If we are in paddle area
		if (posZ + diam >= paddMaxPosZ || posZ - diam <= paddMinPosZ) {
			//	Check out of bounds
			if (posX + diam >= widthLimit || posX - diam <= -(widthLimit))
				this.velocity.x = -(this.velocity.x);
		}
		else if (posX + diam >= widthLimit || posX - diam <= -(widthLimit)) {
			// Last paddle Hit == WINNER
			this.reset();
			console.log("OUT OF BOUNDS");
		}

		//	Check top and bottom edges -> Walls
		if (posZ + diam >= heightLimit || posZ - diam <= -(heightLimit))
			this.velocity.z = -(this.velocity.z);
		
		this.mesh.position.x += this.velocity.x;
		this.mesh.position.z += this.velocity.z;
	}

	/**
	 * Should launch in random direction from the middle of the ground
	 */
	launch() {
	}

	/**
	 * Reset position of the ball
	 */
	reset() {
		this.mesh.position.x = 0;
		this.mesh.position.z = 0;
	}

	/**
	 * There is 3 cases :
	 * 	- new pos is out of bounds = last hit paddle wins
	 * 	- new pos is in wall = invert direction according to velocity
	 * 	- new pos is in padlle = update last paddle hit and new dir
	 */
	// checkPaddleCollision(paddle, posX, posZ, diam) {
	// 	const paddMinPosX = paddle.mesh.position.x - (paddle.meshSize.width / 2);
	// 	const paddMaxPosX = paddle.mesh.position.x + (paddle.meshSize.width / 2);
		

	// 	if (posZ + diam >= paddMaxPosZ || posZ - diam <= paddMinPosZ) {
	// 		if (posX + diam >= paddMaxPosX || posX - diam <= paddMinPosX)
	// 			this.velocity.x = -(this.velocity.x);
	// 		return 1;
	// 	}
	// 	return 0;
	// }
}