import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Color4, GlowLayer, Mesh, ArcRotateCamera } from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { sendMatchesPostRequest } from "./sendMatches";
import { State, IPlayer, IRound, IOptions } from "./Data"
import { Ball } from "./Ball";
import { Paddle } from './Paddle';
import { createCamera, createText, createMap, createLight, createAnimation } from './Graphics';

export interface IPaddle {
	paddle: Paddle,
	player: IPlayer,
	text: TextBlock
};

export class Pong {
	static MAP_WIDTH = 10;
	static MAP_HEIGHT = 6;
	static MAX_SCORE = 3;
	static MAX_ROUNDS = 1;

	canvas: HTMLCanvasElement;
	engine: Engine;
	gameScene: Scene;
	gui: AdvancedDynamicTexture;
	camera: ArcRotateCamera;
	ball: Ball;
	options: IOptions;
	robot: boolean;
	state: State;
	time: number;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	players: Array<IPlayer>;

	constructor(canvasId: string, userId: Array<number>, options: IOptions) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.engine = new Engine(this.canvas, true);
		this.gameScene = null;
		this.gui = null;
		this.camera = null;
		this.ball = null;
		this.options = options;
		this.state = State.opening;
		this.time = Date.now();
		this.robot = options.nbOfPlayer == 1 ? true: false;
		this.leftPadd = { paddle: null, player: null, text: null };
		this.rightPadd = { paddle: null, player: null, text: null };
		if (options.nbOfPlayer === 1) {
			// special case: player is a robot
			this.players = [{ id: 0, score: 0 }];
			this.players.push({ id: userId[0], score: 0 });
		} else {
			this.players = userId.slice(0, options.nbOfPlayer).map(id => ({
				id,
				score: 0
			}));
		}
		if (options.nbOfPlayer >= 4) Pong.MAX_ROUNDS = options.nbOfPlayer - 1;
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

		// Exclude map from bloom effect
		// glowLayer.addExcludedMesh(map);

		//	Create the ball
		this.ball = new Ball(this.gameScene, this.options.level, this.options.ballColor);

		//	Creates 2 paddles, one for each players and 2DText for visual scoring
		this.leftPadd.paddle = new Paddle(this.gameScene, "left", Pong.MAP_WIDTH, this.options.level, this.options.paddColor);
		this.rightPadd.paddle = new Paddle(this.gameScene, "right", Pong.MAP_WIDTH, this.options.level, this.options.paddColor);
		const line = createText("|", "white", 38, "-150px", "0px", this.gui);
		this.leftPadd.text = createText("0", "white", 38, "-150px", "-100px", this.gui);
		this.rightPadd.text = createText("0", "white", 38, "-150px", "100px", this.gui);

		console.log("GAME-STATE: loaded");
	}

	/**
	 * 	- Start the game by launching the ball and monitoring the score
	 * 	- Manage user input and render the scene
	 */
	runGame(): void {
		if (!this.engine || !this.gameScene || !this.ball || !this.leftPadd.paddle || !this.rightPadd.paddle) {
			console.error("while loading 'Pong' game");
			return ;
		}

		const keys = {};
		let rounds: Array<IRound> = null;
		let roundIndex: number = 0;
		let playerIndex: number = 0;
		let isNewRound: boolean = true;

		roundIndex += this.newRound(playerIndex, roundIndex);
		//	Manage user input
		this.handleInput(keys);
		this.gameScene.registerBeforeRender(() => {
			if (this.state === State.opening) this.opening();
			if (this.state === State.play) this.updateGame(keys);
			isNewRound = this.monitoringRounds(roundIndex);
			if (isNewRound === true) {
				rounds = this.saveResults(rounds);
				roundIndex += this.newRound(playerIndex, roundIndex);
			}
			if (this.state === State.end) this.endGame(rounds, roundIndex);
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

	newRound(playerIndex: number, roundIndex: number): number {
		console.log("GAME-STATE: new round");
		//	Reset data
		this.leftPadd.paddle.resetPosition(Pong.MAP_WIDTH, "left");
		this.rightPadd.paddle.resetPosition(Pong.MAP_WIDTH, "right");
		this.leftPadd.text.text = "0";
		this.rightPadd.text.text = "0";
		this.ball.reset(true);

		if (playerIndex >= this.options.nbOfPlayer || roundIndex >= Pong.MAX_ROUNDS) return 0;
		//	Who's playing now ?
		this.leftPadd.player = this.players[playerIndex];
		playerIndex++;
		this.rightPadd.player = this.players[playerIndex];
		playerIndex++;

		//	Update each player's name -- TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!
		//	Update gameHistoryTree -- TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		return 1;
	}

	/**
	 * 	- Save current round's results
	 */
	saveResults(rounds: Array<IRound>): Array<IRound> {
		if (!this.leftPadd.player || !this.rightPadd.player) return rounds;

		console.log("GAME-STATE: saving results");
		let results: IRound;
		if (this.leftPadd.player.score == Pong.MAX_SCORE) {
			results = {
				winnerId: this.leftPadd.player.id,
				maxScore: this.leftPadd.player.score,
				loserId: this.rightPadd.player.id,
				minScore: this.rightPadd.player.score
			};
		} else {
			results = {
				winnerId: this.rightPadd.player.id,
				maxScore: this.rightPadd.player.score,
				loserId: this.leftPadd.player.id,
				minScore: this.leftPadd.player.score
			};
		}
		if (!rounds)
			rounds = [ results ];
		else
			rounds.push(results);
		return rounds;
	}

	/**
	 * 	- Listen to new user input and update game data accordingly
	 */
	updateGame(keys: {}): void {
		//	Move and update direction if there has been an impact with the ball
		this.ball.move(this.time);
		if (this.ball.update(this.leftPadd, this.rightPadd) == true)
			this.launch(3);
		
		//	If a user presses a key, update the position of its padd
		if (keys["ArrowDown"]) this.rightPadd.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
		if (keys["ArrowUp"]) this.rightPadd.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		if (this.robot === false) {
			if (keys["s"]) this.leftPadd.paddle.move("down", (Pong.MAP_HEIGHT / 2), this.time);
			if (keys["w"]) this.leftPadd.paddle.move("up", (Pong.MAP_HEIGHT / 2), this.time);
		}
		else
			this.leftPadd.paddle.autoMove(this.ball, (Pong.MAP_HEIGHT / 2), this.time);

		//	Update visual-scoring in the scene
		this.leftPadd.text.text = this.leftPadd.player.score.toString();
		this.rightPadd.text.text = this.rightPadd.player.score.toString();
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

	endGame(rounds: Array<IRound>, roundIndex:number ) {
		if (!rounds || roundIndex < 0) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-STATE: the winner is " + rounds[roundIndex - 1].winnerId);
		console.log("GAME-STATE: the looser is " + rounds[roundIndex - 1].loserId);
		sendMatchesPostRequest(rounds[roundIndex - 1], Date.now());
	}

	/**
	 * 	- Check if any of the players have reached the maximum score
	 */
	monitoringRounds(roundIndex: number): boolean {
		if (!this.leftPadd.player || !this.rightPadd.player) return false;

		if (this.leftPadd.player.score == Pong.MAX_SCORE || this.rightPadd.player.score == Pong.MAX_SCORE) {
			console.log("GAME-STATE: a player has won the round");
			if (roundIndex >= Pong.MAX_ROUNDS) this.state = State.end;
			return true;
		}
		return false;
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
