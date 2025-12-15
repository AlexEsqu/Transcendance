import { Engine } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { sendMatchesPostRequest } from "./sendMatches";
import { State, IPlayer, IRound, IOptions, IScene } from "./Data"
import { Ball } from "./Ball";
import { Paddle } from './Paddle';
import { createText, createAnimation, loadGame } from './Graphics';
import { monitoringRounds, saveResults, newRound, drawMatchHistoryTree } from './manageRounds';

export interface IPaddle {
	paddle: Paddle,
	player: IPlayer,
	scoreText: TextBlock,
	nameText: TextBlock
};

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 2;
	static MAX_ROUNDS = 1;

	canvas: HTMLCanvasElement;
	engine: Engine;
	gui: AdvancedDynamicTexture;
	robot: boolean;
	time: number;
	isLaunched: boolean;
	onNewRound?: () => void;
	scene: IScene;
	canvasUI: HTMLCanvasElement;

	constructor(canvasId: string, options: IOptions, onNewRound?: () => void) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		this.gui = null;
		this.scene = null;
		this.robot = false;
		if (options.nbOfPlayers >= 4) Pong.MAX_ROUNDS = options.nbOfPlayers - 1;
		this.onNewRound = onNewRound;
		this.isLaunched = false;
		this.scene = loadGame(this.engine, this.canvas, options, this.gui);
		let players = options.players.slice(0, options.nbOfPlayers).map(name => ({ name, id: 0, score: 0 }));
		if (options.nbOfPlayers === 1) {
			// special case: player is a robot
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
		if (!this.engine || !this.scene) {
			console.error("while loading 'Pong' game");
			return ;
		}

		let playersColors: Array<string> = [ "rgba(141, 188, 255, 1)" ];
		let roundsColors: Array<string> = [ "rgb(141, 188, 255, 1)" ];
		for (let i = 0; i <= 6; i++)
			playersColors.push("rgb(141, 188, 255, 1)");
		for (let i = 0; i <= 5; i++)
			roundsColors.push("rgb(141, 188, 255, 1)");

		newRound(this.scene, 0, null, 0);

		const keys = {};
		let rounds: Array<IRound> = null;
		let roundIndex: number = 1;
		let playerIndex: number = 2;
		let isNewRound: boolean = true;

		//	Manage user input
		this.handleInput(keys);
		this.scene.id.registerBeforeRender(() => {
			if (this.scene.state === State.opening) this.opening();
			if (this.scene.state === State.play && this.isLaunched) {
				let status = this.updateGame(keys);
				isNewRound = monitoringRounds(this.scene, roundIndex);
				if (status && !isNewRound) this.launch(3);
				if (isNewRound) {
					this.scene.state = State.pause;
					this.isLaunched = false;
					rounds = saveResults(this.scene.leftPadd, this.scene.rightPadd, rounds);
					if (newRound(this.scene, playerIndex, rounds, roundIndex)) {
						roundIndex += 1;
						playerIndex += 2;
					}
					if (this.onNewRound) this.onNewRound();
				}
			}
			
			if (this.scene.state === State.end) this.endGame(rounds, roundIndex);
			this.time = Date.now();
		});
		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (!this.scene.id || this.scene.state === State.end) {
				console.log("GAME-STATE: end");
				this.engine.stopRenderLoop();
			}
			this.scene.id.render();
			drawMatchHistoryTree(this.canvasUI, playersColors, roundsColors);
		});
	}

	/**
	 * 	- Listen to new user input and update data accordingly
	 */
	updateGame(keys: {}): number {
		let status: number = 0;
		//	Move and update direction if there has been an impact with the ball
		this.scene.ball.move(this.time);
		if (this.scene.ball.update(this.scene.leftPadd, this.scene.rightPadd) == true)
			status = 1;
		
		let paddle: Paddle = null;
		let side: string = "down";
		//	If a user presses a key, update the position of its padd
		if (keys["ArrowDown"] || keys["ArrowUp"]) {
			paddle = this.scene.rightPadd.paddle;
			if (keys["ArrowUp"]) side = "up";
		}
		if (!this.robot && (keys["s"] || keys["w"])) {
			paddle = this.scene.leftPadd.paddle;
			if (keys["w"]) side = "up";
		} else 
			this.scene.leftPadd.paddle.autoMove(this.scene.ball, (Pong.MAP_HEIGHT / 2), this.time);
		if (paddle)
			paddle.move(side, Pong.MAP_HEIGHT / 2, this.time);

		//	Update visual-scoring in the scene
		// this.scene.leftPadd.scoreText.text = this.scene.leftPadd.player.score.toString();
		// this.scene.rightPadd.scoreText.text = this.scene.rightPadd.player.score.toString();

		return status;
	}

	launch(count: number): void {
		if (count <= 0) {
			this.scene.state = State.play;
			this.isLaunched = true;
			this.scene.ball.launch();
			return ;
		}
		this.scene.state = State.launch;
		
		const keys = [
			{ frame: 0, value: 60 },
			{ frame: 30, value: 30 }
		];
		this.gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

		const timer = createText(count.toString(), this.scene.options.ballColor, 60, "200px", "0px", this.gui);
		const animation = createAnimation("timer", "fontSize", keys);
		
		timer.animations = [animation];
		this.scene.id.beginAnimation(timer, 0, 30, false, 1, () => {
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

		this.scene.camera.animations = [];
		this.scene.camera.animations.push(animation);
		this.scene.id.beginAnimation(this.scene.camera, 0, 60, false);
		this.scene.state = State.pause;
	}

	endGame(rounds: Array<IRound>, roundIndex:number ) {
		if (!rounds || roundIndex < 0) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-STATE: the winner is " + rounds[roundIndex - 1].winner.name);
		console.log("GAME-STATE: the looser is " + rounds[roundIndex - 1].loser.name);
		// sendMatchesPostRequest(rounds[roundIndex - 1], Date.now());
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
                if (this.scene.id.debugLayer.isVisible()) {
                    this.scene.id.debugLayer.hide();
                } else {
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

