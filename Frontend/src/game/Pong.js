import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';
// import { Ball } from "./Ball";

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
        this.canvas.style.height = '50%';

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
			if (this.scene)
				this.scene.render();
		});
	}

	createScene() {
		// Scene settings
		this.scene = new Scene(this.engine);
		this.scene.createDefaultLight();

		// Camera settings
		const camera = new ArcRotateCamera(
			'arCamera',
			-Math.PI / 2, // alpha
			Math.PI / 3, // beta
			10, // radius
			Vector3.Zero(), // target
			this.scene
		);
		// Allow to move the camera -> uncomment for debug
		// camera.attachControl(this.canvas, true);w

		// Light settings
		const light = new HemisphericLight(
			'light',
			new Vector3(0, 1, 0),
			this.scene
		);
		light.intensity = 0.8;

		// Set ground
		MeshBuilder.CreateGround(
			'ground',
			{
				width: 10,
				height: 6,
			},
			this.scene
		);

		// Set Ball
		// this.ball = new Ball();

		// Set a gizmo for debug
		// const gizmoManager = new GizmoManager(scene);
		// gizmoManager.positionGizmoEnabled = true;
		// gizmoManager.attachToMesh(ball);

		// Set Paddles
	}
}
