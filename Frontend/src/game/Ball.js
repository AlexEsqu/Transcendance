import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';

// Contains every data about the ball
// Handle position, velocity, direction
// Detects collision with walls and paddles
// Reset postion after a user wins

// take reference from the scene
// set constant values like speed
// set lastHitPaddle
// Create mesh, material
// function to launch or stop the ball
// function to update position of the ball according to delta time, collision etc
// reset values function
// collision detection function

export class Ball {
	constructor(scene) {
		this.scene = scene;
		this.mesh = MeshBuilder.CreateSphere('ball', { diameter: 0.5 }, scene);
		this.mesh.position = new Vector3(0, 1, 0);
	}

	update() {
		// const speed = 5;
		// this.mesh.position.x += 0.1;
		// if (this.mesh.position.x >= 6)
		// 	this.mesh.position.x = 0;
		// const targetPos = this.mesh.position.add(Vector3(1, 1, 1));
		// check for collisions detection
		// this.animate(targetPos, 2);
	}

	/**
	 * Should have 2 options :
	 * 	- launch from the last winner paddle
	 * 	- launch in random direction from the middle of the ground
	 */
	launch() {

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