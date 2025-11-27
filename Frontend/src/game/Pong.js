import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Color3, GlowLayer } from '@babylonjs/core';
import { createCamera, createVisualScoring, createMap } from "./Graphics"
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 10;

	constructor(canvasId, user1, user2, robot) {
		this.canvas = document.getElementById(canvasId);
		this.engine = new Engine(this.canvas, true);
		this.scene = null;
		this.ball = null;
		this.robot = true;
		if (!robot || robot === undefined) this.robot = false;
		if (user1 === undefined) user1 = "Anonymous1";
		if (user2 === undefined) user2 = "Anonymous2"
		this.player1 = { score: 0, paddle: null, text: "0", name: user1};
		this.player2 = { score: 0, paddle: null, text: "0", name: user2};
	}

	/**
	 * 	- Create environment and objects of the game
	 * 	- Camera, light, map, ball, paddles and visual-scoring
	 */
	loadGame() {
		if (!this.engine) return ;

		this.scene = new Scene(this.engine);
		createCamera(this.scene, this.canvas);

		//	Remove default background color
		this.scene.clearColor = new Color3(0, 0, 0);

		//	Create a glow layer to add a bloom effect around meshes
		const glowLayer = new GlowLayer("glow", this.scene, { mainTextureRatio: 0.2 });
		glowLayer.intensity = 0.5;
		glowLayer.blurKernelSize = 9;

		const map = createMap(this.scene);

		// Exclude bloom effect on the map
		glowLayer.addExcludedMesh(map);
		
		//	Create the ball
		this.ball = new Ball(this.scene);

		//	Creates 2 paddles, one for each players and 2DText for visual scoring
		this.player1.paddle = new Paddle(this.scene, "left", Pong.MAP_WIDTH);
		this.player2.paddle = new Paddle(this.scene, "right", Pong.MAP_WIDTH);
		const line = createVisualScoring("|", "white", 32, "-250px", "0px");
		this.player1.text = createVisualScoring("0", "white", 32, "-250px", "-100px");
		this.player2.text = createVisualScoring("0", "white", 32, "-250px", "100px");
		console.log("Game STATE: loaded");
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	startPlay() {
		if (!this.scene || !this.ball || !this.player1.paddle || !this.player2.paddle) {
			console.log("Error: while loading 'Pong' game");
			return ;
		}
		//	Should add a start start button --> TO DO ?
		console.log("Game STATE: started");
		this.ball.launch();

		//	Manage user input
		const keys = {};
		this.handleInput(keys);
		this.scene.registerBeforeRender(() => {
			this.update(keys);
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (this.scene) this.scene.render();
			if (this.monitoringScore() == false) {
				console.log("Game STATE: ended ");
				this.engine.stopRenderLoop();
			}
		});
	}

	update(keys) {
		if (this.robot === false) {
			if (keys["s"]) this.player1.paddle.move("down", (Pong.MAP_HEIGHT / 2));
			if (keys["w"]) this.player1.paddle.move("up", (Pong.MAP_HEIGHT / 2));
		}
		else
			this.player1.paddle.autoMove(this.ball.mesh.position.z, this.ball.mesh.position.x, (Pong.MAP_HEIGHT / 2));
		if (keys["ArrowDown"]) this.player2.paddle.move("down", (Pong.MAP_HEIGHT / 2));
		if (keys["ArrowUp"]) this.player2.paddle.move("up", (Pong.MAP_HEIGHT / 2));
		if (this.ball) this.ball.update(this.player1, this.player2);
		//	Update visual-score in the scene
		this.player1.text.text = this.player1.score.toString();
		this.player2.text.text = this.player2.score.toString();
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
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
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
			if (evt.key === "ArrowDown" || evt.key === "ArrowUp")
				evt.preventDefault();
			keys[evt.key] = true;
		});
		window.addEventListener("keyup", (evt) => {
			keys[evt.key] = false;
		});
	}
}
