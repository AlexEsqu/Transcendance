import { Engine } from '@babylonjs/core';
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { sendMatchesPostRequest } from "./sendMatches";
import { State, IPlayer, IRound, IOptions, IScene } from "./Data"
import { Ball } from "./Ball";
import { Paddle } from './Paddle';
import { createAnimation, loadGame, createText } from './Graphics';
import { monitoringRounds, saveResults, newRound, drawMatchHistoryTree, drawScore, drawName } from './manageRounds';

export interface IPaddle {
	paddle: Paddle  | null,
	player: IPlayer | null,
};

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 2;
	static MAX_ROUNDS = 1;

	canvas: HTMLCanvasElement;
	engine: Engine;
	gui: AdvancedDynamicTexture | null;
	robot: boolean;
	time?: number;
	isLaunched: boolean;
	onNewRound?: () => void;
	scene: IScene | null;
	canvasUI?: HTMLCanvasElement;

	constructor(canvasId: string, options: IOptions, onNewRound?: () => void) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		this.gui = null;
		this.scene = null;
		this.robot = false;
		if (options.nbOfPlayers >= 4) Pong.MAX_ROUNDS = options.nbOfPlayers - 1;
		this.onNewRound = onNewRound;
		this.isLaunched = false;
		this.scene = loadGame(this.engine, this.canvas, options);
		if (!this.scene) return ;
		let players = options.players.slice(0, options.nbOfPlayers).map(name => ({ name, id: 0, score: 0 }));
		if (options.nbOfPlayers === 1) { // special case: opponent is a robot
			this.robot = true;
			players.push({ id: 0, name: "Robot", score: 0 });
			players.reverse();
		}
		this.scene.players = players;
		this.scene.state = State.opening;
		this.time = Date.now();
		this.canvasUI = document.getElementById("ui-canvas") as HTMLCanvasElement;
		this.canvasUI.width = window.innerWidth;
		this.canvasUI.height = window.innerHeight;
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	runGame(): void {
		if (!this.engine || !this.scene || !this.scene.id) {
			console.error("while loading 'Pong' game");
			return ;
		}

		const keys: Record<string, boolean> = {};
		let isNewRound: boolean = true;
		let rounds: IRound = { results: null, nbOfRounds: 0, playerIndex: 0 };

		//	Manage user input and update data before render
		this.handleInput(keys);
		this.scene.id.registerBeforeRender(() => {
			if (this.scene && this.scene.state === State.opening) this.opening();
			if (this.scene && this.scene.state === State.end) this.endGame(rounds);
			if (this.scene && this.scene.state === State.play && this.isLaunched) {
				let launch = this.updateGame(keys);
				isNewRound = monitoringRounds(this.scene, rounds.nbOfRounds);
				if (launch && !isNewRound) this.launch(3);
			}
			if (isNewRound) { rounds = this.requestNewRound(rounds); console.log(rounds); }
			isNewRound = false;
			this.time = Date.now();
		});
		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (this.scene &&( !this.scene.id || this.scene.state === State.end)) this.engine.stopRenderLoop();
			if (this.scene && this.scene.id) this.scene.id.render();
		});
	}

	requestNewRound(rounds: IRound): IRound
	{
		if (this.scene) this.scene.state = State.pause;
		this.isLaunched = false;

		let currentNbOfRounds: number = 0;
		if (rounds) currentNbOfRounds = rounds.nbOfRounds;

		if (this.scene && this.scene.leftPadd && this.scene.rightPadd) {
			rounds = saveResults(this.scene.leftPadd, this.scene.rightPadd, rounds);
			rounds = newRound(this.scene, rounds)
			rounds.nbOfRounds += 1;

			if (currentNbOfRounds < rounds.nbOfRounds
				&& this.canvasUI && this.scene && this.scene.leftPadd.player && this.scene.rightPadd.player) {
				// drawMatchHistoryTree(this.canvasUI, playersColors, roundsColors, this.scene.options.nbOfPlayers);
				drawName(this.canvasUI, this.scene.leftPadd.player.name, this.scene.rightPadd.player.name, rounds.nbOfRounds);
				drawScore(this.canvasUI,  this.scene.leftPadd.player.score,  this.scene.rightPadd.player.score);
			}
		}

		if (this.onNewRound && rounds.nbOfRounds <= Pong.MAX_ROUNDS) this.onNewRound();

		return rounds;
	}

	/**
	 * 	- Listen to new user input and update data accordingly
	 */
	updateGame(keys: Record<string, boolean>): number
	{
		let status: number = 0;
		let paddle: Paddle | null = null;
		let side: string = "down";

		if (this.scene && keys && this.scene.ball && this.time && this.canvasUI
			&& this.scene.leftPadd && this.scene.leftPadd.paddle && this.scene.rightPadd && this.scene.rightPadd.paddle) {
			//	Move and update direction if there has been an impact with the ball
			this.scene.ball.move(this.time);
			if (this.scene.ball.update(this.scene.leftPadd, this.scene.rightPadd) == true)
				status = 1;

			//	If a user presses a key, update the position of its padd
			if (keys["ArrowDown"] || keys["ArrowUp"]) {
				paddle = this.scene.rightPadd.paddle;
				if (keys["ArrowUp"]) side = "up";
			}
			if (!this.robot && (keys["s"] || keys["w"])) {
				paddle = this.scene.leftPadd.paddle;
				if (keys["w"]) side = "up";
			}

			if (this.robot) this.scene.leftPadd.paddle.autoMove(this.scene.ball, (Pong.MAP_HEIGHT / 2), this.time);
			if (paddle) paddle.move(side, Pong.MAP_HEIGHT / 2, this.time);

			if (this.scene.leftPadd.player && this.scene.rightPadd.player)
				drawScore(this.canvasUI,  this.scene.leftPadd.player.score,  this.scene.rightPadd.player.score);
		}

		return status;
	}

	launch(count: number): void {
		if (count <= 0 && this.scene && this.scene.ball) {
			this.scene.state = State.play;
			this.isLaunched = true;
			this.scene.ball.launch();
			return ;
		}
		if (this.scene) this.scene.state = State.launch;

		const keys = [
			{ frame: 0, value: 60 },
			{ frame: 30, value: 30 }
		];
		this.gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

		if (this.scene && this.scene.options && this.scene.id) {
			const timer = createText(count.toString(), this.scene.options.ballColor, 60, "200px", "0px", this.gui);
			const animation = createAnimation("timer", "fontSize", keys);

			timer.animations = [animation];
			this.scene.id.beginAnimation(timer, 0, 30, false, 1, () => {
				if (this.gui) this.gui.removeControl(timer);
				count--;
				this.launch(count);
			});
		}
	}

	opening(): void {
		console.log("GAME-STATE: opening");
		const keys = [
			{ frame: 0, value: 0 },
			{ frame: 60, value: (Math.PI / 4) }
		];
		const animation = createAnimation("cameraBetaAnim", "beta", keys);

		if (this.scene && this.scene.camera && this.scene.id) {
			this.scene.camera.animations = [];
			this.scene.camera.animations.push(animation);
			this.scene.id.beginAnimation(this.scene.camera, 0, 60, false);
			this.scene.state = State.pause;
		}
	}

	endGame(rounds: IRound) {
		if (!rounds || rounds.nbOfRounds < 0) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-STATE: end");
		// sendMatchesPostRequest(rounds[roundIndex - 1], Date.now());
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	handleInput(keys: Record<string, boolean>): void {
		//	Resize the game with the window
		window.addEventListener('resize', () => {
			this.engine.resize();
			if (this.canvasUI && this.scene && this.scene.leftPadd && this.scene.leftPadd.player && this.scene.rightPadd && this.scene.rightPadd.player) {
				this.canvasUI.width = window.innerWidth;
				this.canvasUI.height = window.innerHeight;
				drawName(this.canvasUI, this.scene.leftPadd.player.name, this.scene.rightPadd.player.name, this.scene.options.nbOfPlayers);
				drawScore(this.canvasUI, this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
			}
			// drawMatchHistoryTree()
		});
		//	Shift+Ctrl+Alt+I == Hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this.scene && this.scene.id && this.scene.id.debugLayer.isVisible()) {
                    this.scene.id.debugLayer.hide();
                } else if (this.scene && this.scene.id) {
                    this.scene.id.debugLayer.show();
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
