import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Color4, GlowLayer } from '@babylonjs/core';
import { createCamera, createVisualScoring, createMap, createLight } from "./Graphics"
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { createAttachElement } from "../landing/utils";

export interface Player {
    score: number;
    paddle: Paddle | null;
    name?: string;
    text?: any;
}

export class Pong {
	static MAP_WIDTH = 8.5;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 11;

	canvas: HTMLCanvasElement;
	engine: Engine;
	gameScene: Scene;
	menuScene: Scene;
	endScene: Scene;
	ball: Ball;
	robot: boolean;
	player1: Player;
	player2: Player;
	time: number;

	constructor(canvasId: string, user1?: string, user2?: string, robot?: boolean) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		this.gameScene = null;
		this.menuScene = null;
		this.endScene = null;
		this.ball = null;
		this.robot = true;
		if (!robot || robot === undefined) this.robot = false;
		this.player1 = { score: 0, paddle: null, text: "0", name: user1 ?? "Anonymous1"};
		this.player2 = { score: 0, paddle: null, text: "0", name: user2 ?? "Anonymous2"};
		this.time = Date.now();
	}

	/**
	 * 	- Create all scenes and game elements
	 */
	loadGame(): void {
		if (!this.engine) return ;

		this.gameScene = new Scene(this.engine);
		createCamera(this.gameScene, this.canvas);
		createLight(this.gameScene);

		//	Remove default background color
		this.gameScene.clearColor = new Color4(0.004, 0.004, 0.102);

		//	Create a glow layer to add a bloom effect around meshes
		const glowLayer = new GlowLayer("glow", this.gameScene, { mainTextureRatio: 0.6 });
		glowLayer.intensity = 0.7;
		glowLayer.blurKernelSize = 128;

		const map = createMap(this.gameScene);

		// Exclude bloom effect on the map
		glowLayer.addExcludedMesh(map);

		//	Create the ball
		this.ball = new Ball(this.gameScene);

		//	Creates 2 paddles, one for each players and 2DText for visual scoring
		this.player1.paddle = new Paddle(this.gameScene, "left", Pong.MAP_WIDTH);
		this.player2.paddle = new Paddle(this.gameScene, "right", Pong.MAP_WIDTH);
		const line = createVisualScoring("|", "white", 32, "-250px", "0px");
		this.player1.text = createVisualScoring("0", "white", 32, "-250px", "-100px");
		this.player2.text = createVisualScoring("0", "white", 32, "-250px", "100px");
		console.log("Game STATE: loaded");
		
		this.displayMenu();
		// if (!this.menuScene || !this.gameScene || !this.endScene)
			//	Handle error, message. stop processing ?
	}

	displayMenu() {
		const test : HTMLElement = createAttachElement("h1", this.canvas, "test", "test");
		test.appendChild(document.createTextNode("MENU"));
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	startPlay(): void {
		if (!this.engine || !this.gameScene || !this.ball || !this.player1.paddle || !this.player2.paddle) {
			console.log("Error: while loading 'Pong' game");
			return ;
		}
		//	Should add a start start button --> TO DO ?
		console.log("Game STATE: started");
		this.ball.launch();

		//	Manage user input
		const keys = {};
		this.handleInput(keys);
		this.gameScene.registerBeforeRender(() => {
			this.update(keys);
			this.time = Date.now();
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (this.gameScene) this.gameScene.render();
			if (this.monitoringScore() == false) {
				console.log("Game STATE: ended ");
				this.engine.stopRenderLoop();
			}
		});
	}

	/**
	 * 	- Listen to new user input and update game data accordingly
	 */
	update(keys: {}): void {
		if (this.ball) {
			this.ball.move(this.time);
			this.ball.update(this.player1, this.player2);
		}
		if (this.robot === false) {
			if (keys["s"]) this.player1.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
			if (keys["w"]) this.player1.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		}
		else
			this.player1.paddle.autoMove(this.ball, (Pong.MAP_HEIGHT / 2), this.time);
		if (keys["ArrowDown"]) this.player2.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
		if (keys["ArrowUp"]) this.player2.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		//	Update visual-score in the scene
		this.player1.text.text = this.player1.score.toString();
		this.player2.text.text = this.player2.score.toString();
	}

	/**
	 * 	- Create environment and objects of the game
	 * 	- Camera, light, map, ball, paddles and visual-scoring
	 */
	createGameScene(): void {
		
	}

	createMenuScene(): void {

		//	Remove default background color
		// this.gameScene.clearColor = new Color4(0.004, 0.004, 0.102);

		//	Display player's username
		console.log("Game STATE: menu");

		//	Display rules
		//	Button click to start
	}

	/**
	 * 	- Check if any of the players have reached the maximum score
	 */
	monitoringScore(): boolean {
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
	handleInput(keys: {}): void {
		//	Resize the game with the window
		// window.addEventListener('resize', () => {
		// 	this.engine.resize();
		// });
		//	Shift+Ctrl+Alt+I == Hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this.gameScene.debugLayer.isVisible()) {
                    this.gameScene.debugLayer.hide();
                } else {
                    this.gameScene.debugLayer.show();
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
