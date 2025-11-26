import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, Vector3, HemisphericLight } from '@babylonjs/core';
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 10;

	constructor(canvasId, user1, user2) {
		this.canvas = document.getElementById(canvasId);
		// this.canvas.style.width = '100%';
        // this.canvas.style.height = '50%';
		this.engine = new Engine(this.canvas, true);
		this.scene = null;
		this.ball = null;
		this.advancedTexture = null;
		if (user1 === undefined)
			user1 = "Anonymous1";
		if (user2 === undefined)
			user2 = "Anonymous2"
		this.player1 = { score: 0, paddle: null, text: "0", name: user1};
		this.player2 = { score: 0, paddle: null, text: "0", name: user2};
	}

	/**
	 * 	- Create the game scene
	 */
	loadGame() {
		this.createScene();
		console.log("Game STATE: loaded");
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	startPlay() {
		//	Should add a start start button --> TO DO ?
		console.log("Game STATE: started");
		this.ball.launch();

		//	Manage user input
		const keys = {};
		this.handleInput(keys);
		this.scene.registerBeforeRender(() => {
			if (keys["ArrowDown"]) this.player2.paddle.move("down", (Pong.MAP_HEIGHT / 2));
			if (keys["ArrowUp"]) this.player2.paddle.move("up", (Pong.MAP_HEIGHT / 2));
			if (keys["s"]) this.player1.paddle.move("down", (Pong.MAP_HEIGHT / 2));
			if (keys["w"]) this.player1.paddle.move("up", (Pong.MAP_HEIGHT / 2));
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (this.ball) this.ball.update(this.player1, this.player2);
			//	Update visual-score in the scene
			this.player1.text.text = this.player1.score.toString();
			this.player2.text.text = this.player2.score.toString();
			if (this.scene) this.scene.render();
			if (this.monitoringScore() == false) {
				console.log("Game STATE: ended ");
				this.engine.stopRenderLoop();
			}
		});
	}

	/**
	 * 	- Check if any of the players have reached the maximum score
	 */
	monitoringScore() {
		//	Create a scene that displays the winner name -> TO DO
		if (this.player1.score == Pong.MAX_SCORE) {
			console.log("Game STATE: the winner is " + this.player1.name);
			return false;
		} else if (this.player2.score == Pong.MAX_SCORE) {
			console.log("Game STATE: the winner is " + this.player2.name);
			return false;
		}
		return true;
	}

	/**
	 * 	- Create environment and objects of the game
	 * 	- Camera, light, map, ball, paddles and visual-scoring
	 */
	createScene() {
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

		//	Create and configure the map ground
		const map = MeshBuilder.CreateGround(
			'ground',
			{ width: Pong.MAP_WIDTH, height: Pong.MAP_HEIGHT },
			this.scene
		);

		//	Create the ball
		this.ball = new Ball(this.scene);

		//	Creates 2 paddles, one for each players
		this.player1.paddle = new Paddle(this.scene, this.player1.name, "left", Pong.MAP_WIDTH);
		this.player2.paddle = new Paddle(this.scene, this.player2.name, "right", Pong.MAP_WIDTH);

		//	Create a fullscreen UI
		this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
		//	Create TextBlock to display the score of each player
		const text = new TextBlock();
		text.text = "|	Score	|";
		text.color = "black";
		text.fontSize = 32;
		text.top = "-250px";
		text.left = "0px";
		this.advancedTexture.addControl(text);
		this.player1.text = new TextBlock();
		this.player1.text.text = "0";
		this.player1.text.color = "black";
		this.player1.text.fontSize = 32;
		this.player1.text.top = "-250px";
		this.player1.text.left = "-100px";
		this.advancedTexture.addControl(this.player1.text);
		this.player2.text = new TextBlock();
		this.player2.text.text = "0";
		this.player2.text.color = "black";
		this.player2.text.fontSize = 32;
		this.player2.text.top = "-250px";
		this.player2.text.left = "100px";
		this.advancedTexture.addControl(this.player2.text);
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	handleInput(keys) {
		//	Resize the game with the window
		// window.addEventListener('resize', () => {
		// 	this.engine.resize();
		// });
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
			if (evt.key === "ArrowDown" || evt.key === "ArrowUp")
				evt.preventDefault();
			keys[evt.key] = true;
		});
		window.addEventListener("keyup", (evt) => {
			keys[evt.key] = false;
		});
	}
}
