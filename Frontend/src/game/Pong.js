import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3 } from '@babylonjs/core';

export class Pong {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.engine = new Engine(this.canvas, true);
	}
}