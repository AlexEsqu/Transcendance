import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3 } from '@babylonjs/core';
import { Ball } from './src/game/Ball.js';

// Initialize engine, scene, camera, light
// Create 3D objects : ball, paddles, ground
// Render Loop
// Monitoring, update

export class Pong {
	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.engine = new Engine(this.canvas, true);
		this.scene = null;
	}

	startGame() {
		this.canvas.style.width = '100%';
		this.canvas.style.height = '120%';

		// Create and init the game scene
		this.createScene();
		// Resize the game with the window
		window.addEventListener('resize', () => {
			this.engine.resize();
		})
		// Hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
		// Rendering loop
		this.engine.runRenderLoop(() => {
			//
			this.scene.render();
		});
	}

	createScene() {
		// Scene settings
		this.scene = new Scene(this.engine);
		this.scene.createDefaultLight();

		// Camera settings
		const camera = new BABYLON.ArcRotateCamera(
			'arCamera',
			0, // alpha
			1, // beta
			10, // radius
			new BABYLON.vector3(0, 0, 0), // target
			this.scene
		);
		camera.setTarget(BABYLON.Vector3.Zero());
		// Allow to move the camera -> uncomment for debug
		camera.attachControl(this.canvas, true);

		// Light settings
		const light = new BABYLON.HemisphericLight(
			'light',
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		light.intensity = -0.2;

		// Set ground
		const ground = BABYLON.MeshBuilder.CreateGround(
			'ground',
			{
				width: 4,
				height: 6,
			},
			this.scene
		);

		// Set Ball

		// Set a gizmo for debug
		// const gizmoManager = new BABYLON.GizmoManager(scene);
		// gizmoManager.positionGizmoEnabled = true;
		// gizmoManager.attachToMesh(ball);

		// Set Paddles

	}
}
