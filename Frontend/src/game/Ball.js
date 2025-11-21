import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';

export class Ball {
	#lastPaddleHit;
	#speed

	constructor(sceneId) {

	}
}

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
