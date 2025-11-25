import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

const maxScore = 10;

export class Pong {
	constructor(canvasId, user1, user2) {
		this.canvas = document.getElementById(canvasId);
		this.canvas.style.width = '100%';
        this.canvas.style.height = '50%';
		this.engine = new Engine(this.canvas, true);
		this.scene = null;
		this.ball = null;
		this.groundSize = { width: 10, height: 6 };
		// check if args are undefined ?
		this.player1 = { score: 0, paddle: null, name: user1};
		this.player2 = { score: 0, paddle: null, name: user2};
		this.time = 0;
	}

	startGame() {
		//	Create and init the game scene
		this.createScene();

		console.log("Game STATE: start");
		//	Should add a start start button --> TO DO ?
		this.ball.launch();

		//	Manage user input
		const keys = {};
		this.handleInput(keys);
		this.scene.registerBeforeRender(() => {
			if (keys["ArrowDown"]) this.player2.paddle.move("down", (this.groundSize.height / 2));
			if (keys["ArrowUp"]) this.player2.paddle.move("up", (this.groundSize.height / 2));
			if (keys["s"]) this.player1.paddle.move("down", (this.groundSize.height / 2));
			if (keys["w"]) this.player1.paddle.move("up", (this.groundSize.height / 2));
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			this.time = Date.now();
			if (this.ball) {
				this.ball.update(this.player1, this.player2, this.groundSize, this.time);
				// this.ball.move();
			}
			if (this.scene) this.scene.render();
			if (this.player1.score >= maxScore || this.player2.score >= maxScore) {
				console.log("Score player1: " + this.player1.score);
				console.log("Score player2: " + this.player2.score);
				console.log("Game STATE: end");
				this.engine.stopRenderLoop();
			}
		});
	}

	createScene() {
		//	Create and configure the main scene
		this.scene = new Scene(this.engine);
		this.scene.createDefaultLight();

		//	Create and configure the camera
		const camera = new ArcRotateCamera(
			'arCamera',
			-(Math.PI / 2), // alpha
			0, // beta
			10, // radius
			Vector3.Zero(), // target
			this.scene
		);
		//	Allow to move the camera -> uncomment for debug
		// camera.attachControl(this.canvas, true);

		//	Create and configure the light
		const light = new HemisphericLight(
			'light',
			new Vector3(0, 1, 0),
			this.scene
		);
		light.intensity = 0.2;

		//	Create and configure the ground
		const ground = MeshBuilder.CreateGround(
			'ground',
			{ width: this.groundSize.width, height: this.groundSize.height },
			this.scene
		);

		//	Create the ball
		this.ball = new Ball(this.scene);

		//	Creates 2 paddles, one for each players
		this.player1.paddle = new Paddle(this.scene, this.player1.name, "left", this.groundSize.width);
		this.player2.paddle = new Paddle(this.scene, this.player2.name, "right", this.groundSize.width);
	}

	handleInput(keys) {
		//	Resize the game with the window
		window.addEventListener('resize', () => {
			this.engine.resize();
		});
		//	Shift+Ctrl+Alt+I == Hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });
		//	Detect when a user presses or releases a key to play the game
		window.addEventListener("keydown", (evt) => {
			keys[evt.key] = true;
		});
		window.addEventListener("keyup", (evt) => {
			keys[evt.key] = false;
		});
	}
}
