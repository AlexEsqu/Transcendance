import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Color4, GlowLayer, Mesh, ArcRotateCamera } from '@babylonjs/core';
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { sendMatchesPostRequest } from "./sendMatches";
import { IOptions, Level } from "../landing/game";
import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { createCamera, createText, createMap, createLight, createAnimation } from './Graphics';

export interface IPlayer {
    score: number;
    paddle: Paddle | null;
    id: number;
    text?: any;
};

interface IRound {
	minScore: number;
	maxScore: number;
	winner: number;
	loser: number;
};

enum State {
	opening, launch, play, pause, end
};

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 11;

	canvas: HTMLCanvasElement;
	engine: Engine;
	gameScene: Scene;
	gui: AdvancedDynamicTexture;
	camera: ArcRotateCamera;
	ball: Ball;
	options: IOptions;
	robot: boolean;
	player1: IPlayer;
	player2: IPlayer;
	time: number;
	state: State;

	constructor(canvasId: string, user1: number, user2: number, options: IOptions) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		this.gameScene = null;
		this.gui = null;
		this.camera = null;
		this.ball = null;
		this.options = options;
		this.robot = options.nbOfPlayer == 1 ? true: false;
		this.player1 = { score: 0, paddle: null, text: "0", id: user1 ?? 0};
		this.player2 = { score: 0, paddle: null, text: "0", id: user2};
		this.state = State.opening;
		this.time = Date.now();
	}

	/**
	 * 	- Create the scene and all its elements
	 */
	loadGame(): void {
		if (!this.engine) return ;

		this.gameScene = new Scene(this.engine);
		//	Create a fullscreen UI
		this.gui = AdvancedDynamicTexture.CreateFullscreenUI("UI")

		this.camera = createCamera(this.gameScene, this.canvas);
		// createLight(this.gameScene, this.options.mapColor);

		//	Remove default background color
		this.gameScene.clearColor = new Color4(0, 0, 0, 0);

		//	Create a glow layer to add a bloom effect around meshes
		const glowLayer: GlowLayer = new GlowLayer("glow", this.gameScene, { mainTextureRatio: 0.6 });
		glowLayer.intensity = 0.7;
		glowLayer.blurKernelSize = 64;

		const map: Mesh = createMap(this.gameScene, Pong.MAP_HEIGHT, Pong.MAP_WIDTH, this.options.mapColor);

		// Exclude bloom effect on the map
		// glowLayer.addExcludedMesh(map);

		//	Create the ball
		this.ball = new Ball(this.gameScene, this.options.level, this.options.ballColor);

		//	Creates 2 paddles, one for each players and 2DText for visual scoring
		this.player1.paddle = new Paddle(this.gameScene, "left", Pong.MAP_WIDTH, this.options.level, this.options.paddColor);
		this.player2.paddle = new Paddle(this.gameScene, "right", Pong.MAP_WIDTH, this.options.level, this.options.paddColor);

		const line = createText("|", "white", 38, "-150px", "0px", this.gui);
		this.player1.text = createText("0", "white", 38, "-150px", "-100px", this.gui);
		this.player2.text = createText("0", "white", 38, "-150px", "100px", this.gui);
		console.log("GAME-STATE: loaded");
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	runGame(): void {
		if (!this.engine || !this.gameScene || !this.ball || !this.player1.paddle || !this.player2.paddle) {
			console.error("while loading 'Pong' game");
			return ;
		}

		//	Manage user input
		const keys = {};
		this.handleInput(keys);
		this.gameScene.registerBeforeRender(() => {
			if (this.state === State.opening) this.opening();
			if (this.state === State.play) this.updateGame(keys);
			this.monitoringScore();
			// if (this.state === State.end) this.endGame ();
			this.time = Date.now();
		});
		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (!this.gameScene || this.state === State.end) {
				console.log("GAME-STATE: end");
				this.engine.stopRenderLoop();
			}
			this.gameScene.render();
		});
	}

	/**
	 * 	- Listen to new user input and update game data accordingly
	 */
	updateGame(keys: {}): void {
		//	Move and update direction if there has been an impact with the ball
		this.ball.move(this.time);
		if (this.ball.update(this.player1, this.player2) == true)
			this.launch(3);
		
		//	If a user presses a key, update the position of its padd
		if (keys["ArrowDown"]) this.player2.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
		if (keys["ArrowUp"]) this.player2.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		if (this.robot === false) {
			if (keys["s"]) this.player1.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
			if (keys["w"]) this.player1.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		}
		else
			this.player1.paddle.autoMove(this.ball, (Pong.MAP_HEIGHT / 2), this.time);

		//	Update visual-scoring in the scene
		this.player1.text.text = this.player1.score.toString();
		this.player2.text.text = this.player2.score.toString();
	}

	launch(count: number): void {
		if (count <= 0) {
			this.state = State.play;
			this.ball.launch();
			return ;
		}
		this.state = State.launch;
		
		const keys = [
			{ frame: 0, value: 60 },
			{ frame: 30, value: 30 }
		];
		const timer = createText(count.toString(), this.options.ballColor, 60, "200px", "0px", this.gui);
		const animation = createAnimation("timer", "fontSize", keys);
		
		timer.animations = [animation];
		this.gameScene.beginAnimation(timer, 0, 30, false, 1, () => {
			this.gui.removeControl(timer);
			count--;
			this.launch(count);
		});
	}

	opening(): void {
		console.log("GAME-STATE: opening");
		const keys = [
			{ frame: 0, value: 0 },
			{ frame: 60, value: (Math.PI / 4) }
		];
		const animation = createAnimation("cameraBetaAnim", "beta", keys);

		this.camera.animations = [];
		this.camera.animations.push(animation);
		this.gameScene.beginAnimation(this.camera, 0, 60, false);
		this.state = State.pause;
	}

	/**
	 * 	- Check if any of the players have reached the maximum score
	 */
	monitoringScore(): void {
		if (this.player1.score == Pong.MAX_SCORE) {
			console.log("GAME-STATE: the winner is " + this.player1.id);
			sendMatchesPostRequest(this.player1, this.player2, Date.now());
			this.state = State.end;
		} else if (this.player2.score == Pong.MAX_SCORE) {
			console.log("GAME-STATE: the winner is " + this.player2.id);
			sendMatchesPostRequest(this.player2, this.player1, Date.now());
			this.state = State.end;
		}
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	handleInput(keys: {}): void {
		//	Resize the game with the window
		window.addEventListener('resize', () => {
			this.engine.resize();
		});
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
