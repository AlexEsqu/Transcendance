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
		this.meshSize = { diam: 0.5 };
		this.mesh = MeshBuilder.CreateSphere('ball', { diameter: this.meshSize.diam }, scene);
		this.mesh.position = new Vector3(0.0, 0.3, 0.0);
		this.velocity = { x: 0.04, z: 0.04};
		this.pos = { leftX: 0.0, rightX: 0.0, topZ: 0.0, bottomZ: 0.0 };
		this.lastHitPadd = "";
	}

	move(lastFrameTime) {
		const deltaTime = (Date.now() - lastFrameTime) / 1000;
		this.mesh.position.x += (this.velocity.x);
		this.mesh.position.z += (this.velocity.z);
	}

	update(player1, player2, groundSize) {
		this.pos.leftX = this.mesh.position.x - (this.meshSize.diam / 2);
		this.pos.rightX = this.mesh.position.x + (this.meshSize.diam / 2);
		this.pos.topZ = this.mesh.position.z + (this.meshSize.diam / 2);
		this.pos.bottomZ = this.mesh.position.z - (this.meshSize.diam / 2);

		if (this.mesh.position.x <= 0 && this.isBallHittingPadd(player1, "left") == true)
			return ;
		else if (this.isBallHittingPadd(player2, "right") == true)
			return ;

		const heightLimit = groundSize.height / 2;
		const widthLimit = groundSize.width / 2;

		//	Check top and bottom edges -> Walls
		if (this.pos.topZ >= heightLimit || this.pos.bottomZ <= -(heightLimit))
			this.velocity.z = -(this.velocity.z);
		//	Check if out of bounds
		if (this.pos.rightX > widthLimit || this.pos.leftX < -(widthLimit)) {
			//	Last Hit Paddle == WINNER
			if (this.lastHitPadd === player1.name)
				player1.score += 1;
			else
				player2.score += 1;
			this.reset();
			console.log("Game STATE: +1 point for " + player1.name);
		}
	}

	isBallHittingPadd(player, side) {
		const paddle = player.paddle;
		const paddTopZ = paddle.mesh.position.z + (paddle.meshSize.width / 2);
		const paddBottomZ = paddle.mesh.position.z - (paddle.meshSize.width / 2);
		
		let paddX;
		if (side === "right") {
			paddX = paddle.mesh.position.x - (paddle.meshSize.depth / 2);
			// paddX = paddle.mesh.position.x;
			if (this.pos.rightX <= paddX)
				return false;
		} else {
			paddX = paddle.mesh.position.x + (paddle.meshSize.depth / 2);
			// paddX = paddle.mesh.position.x;
			if (this.pos.leftX >= paddX)
				return false;
		}
		if (this.pos.topZ <= paddTopZ + 0.1 && this.pos.bottomZ >= paddBottomZ - 0.1) {
			//	Is ball in the middle of the padd ?
			if (this.pos.topZ > paddle.mesh.position.z + this 
				&& this.pos.bottomZ < paddle.mesh.position.z - this
			) {
				this.velocity.x = -(this.velocity.x);
			} else {
				this.velocity.z = -(this.velocity.z);
				this.velocity.x = -(this.velocity.x);
			}
			this.lastHitPadd = player.name;
			return true;
		}
		return false;
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
}