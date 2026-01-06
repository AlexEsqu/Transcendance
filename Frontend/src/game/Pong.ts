import { Engine, Color3 } from '@babylonjs/core';
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { sendMatchesPostRequest } from "./sendMatches";
import { State, IPlayer, IRound, IOptions, IScene } from "./Data"
import { Paddle } from './Paddle';
import { createText, createAnimation, loadGame, createMaterial } from './Graphics';
import { monitoringRounds, saveResults, newRound, drawMatchHistoryTree, drawScore, drawName } from './manageRounds';
import { Ball } from './Ball';

export interface IPaddle {
	paddle: Paddle,
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
	waitSocket: WebSocket | null = null;
	socket: WebSocket | null = null;

	constructor(canvasId: string, options: IOptions, onNewRound?: () => void)
	{
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.engine = new Engine(this.canvas, true);
		this.gui = null;
		this.scene = null;
		this.robot = false;
		if (options.nbOfPlayers >= 4) Pong.MAX_ROUNDS = options.nbOfPlayers - 1;
		this.onNewRound = onNewRound;
		this.isLaunched = false;
		this.scene = loadGame(this.engine, this.canvas, options);
		if (!this.scene) return ;
		let players: Array<IPlayer> = this.initPlayers(options.players, options.nbOfPlayers);
		console.log(players);
		if (players.length != options.nbOfPlayers) {
			console.error("players init failed, players are missing");
			return ;
		}
		if (options.nbOfPlayers === 1) { // special case: opponent is a robot
			this.robot = true;
			players.push({ id: 0, name: "Robot", score: 0, color: "#8dbcff" });
			players.reverse();
		}
		this.scene.players = players;
		this.scene.state = State.opening;
		this.time = Date.now();
		this.waitSocket = new WebSocket("ws://localhost:4001/waitingRoom");
		this.waitSocket.onopen = (e) => {
			console.log("CLIENT CONNECTED to game server");
			const JSONForm = {
				id: Date.now(),
				game: 'solo',
				location: 'remote'
			};
			const data = JSON.stringify(JSONForm);
			if (this.waitSocket)
				this.waitSocket.send(data);
		}
	}

	initPlayers(inputs: string[], nbOfPlayer: number): Array<IPlayer>
	{
		let players: Array<IPlayer> = [];
		for (let i = 0; i < nbOfPlayer; i++)
		{
			if (inputs[i])
				players.push({ id: 0, name: inputs[i], score: 0, color: "#"} );
		}
		return players;
	}


	/**
	 * 	- Main loop that displays/renders the game scene and listens for events and inputs to update each frame
	 */
	runGame(): void
	{
		if (!this.engine || !this.scene || !this.scene.id || (this.scene.players && this.scene.players.length <= 1)) {
			console.error("error occured while loading 'Pong' game");
			return ;
		}

		const keys: Record<string, boolean> = {};
		let isNewRound: boolean = true;
		let rounds: IRound = { results: null, nbOfRounds: 0, playerIndex: 0, nodeColor: [] };
		let roomId: number | undefined = undefined;

		interface testJSON {
			roomId: number;
			message: string;
		};

		//	Manage user input and update data before render
		this.handleInput(keys, rounds);
		this.scene.id.registerBeforeRender(() => {
			if (this.waitSocket) this.waitSocket.onmessage = (e) => {
				const gameState: testJSON = JSON.parse(e.data);
				console.log("Received Game server state : ", gameState);
				if (roomId === undefined && gameState.roomId !== undefined) {
					roomId = gameState.roomId;
					this.socket = new WebSocket("ws://localhost:4001/game");
					console.log(`roomID ${roomId}`);
					console.log(`state.roomID ${gameState.roomId}`);
				}
			}
			if (this.socket) this.socket.onopen = (e) => {
				const gameState = {
					id: Date.now(),
					roomId: roomId,
					ready: true,
				};
				console.log(gameState);
				if (roomId !== undefined)
					this.socket?.send(JSON.stringify(gameState));
			}
			if (this.socket) this.socket.onmessage = (e) => {
				const gameState = JSON.parse(e.data);
				console.log("Received Game server state : ", gameState);
			}
			if (this.scene && this.scene.state === State.opening) this.opening();
			if (this.scene && this.scene.state === State.end) this.endGame(rounds);
			if (this.scene && this.scene.state === State.play && this.isLaunched) {
				let launch = this.updateGame(keys);
				isNewRound = monitoringRounds(this.scene, rounds.nbOfRounds);
				//	If 'updateGame' has detected that the ball is out of bounds, must relaunch the ball from the middle of the map
				if (launch && !isNewRound)
					this.launch(3);
			}
			//	If 'monitoringRounds' has detected that a player has reached the max score
			if (isNewRound) { rounds = this.requestNewRound(rounds); console.log(rounds); }
			isNewRound = false;
			this.time = Date.now();
		});
		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (this.scene &&( !this.scene.id || this.scene.state === State.stop)) this.engine.stopRenderLoop();
			if (this.scene && this.scene.id) this.scene.id.render();
		});
	}

	/**
	 * 	- Save the results of the previous match, if needed and/or assign new players their paddles, also reset data if needed
	 */
	requestNewRound(rounds: IRound): IRound
	{
		if (!this.scene) {
			console.error("'scene' object is null");
			return rounds;
		}

		this.scene.state = State.pause;
		this.isLaunched = false;

		let currentNbOfRounds: number = 0;
		if (rounds) currentNbOfRounds = rounds.nbOfRounds;

		//	Save the results of the previous match, if there was one
		if (this.scene.leftPadd && this.scene.rightPadd)
			rounds = saveResults(this.scene.leftPadd, this.scene.rightPadd, rounds);
		//	Assign new players to their paddles for the next match and reset data (paddle & ball)
		rounds = newRound(this.scene, rounds)
		rounds.nbOfRounds += 1;

		// Display names and score of the new players
		if (currentNbOfRounds < rounds.nbOfRounds && this.scene.leftPadd && this.scene.rightPadd)
		{
			// drawMatchHistoryTree(this.canvasUI, playersColors, roundsColors, this.scene.options.nbOfPlayers);
			if (this.scene.leftPadd.player?.name && this.scene.rightPadd.player?.name)
				drawName(this.scene.leftPadd.player.name, this.scene.rightPadd.player.name, rounds.nbOfRounds);
			if (this.scene.leftPadd.player?.score && this.scene.rightPadd.player?.score)
				drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
		}

		//	Display start button to launch the game for a new round
		if (this.onNewRound && rounds.nbOfRounds <= Pong.MAX_ROUNDS)
			this.onNewRound();
		else monitoringRounds(this.scene, rounds.nbOfRounds);

		return rounds;
	}

	/**
	 * 	- Listen to new user inputs and update every paddle's data accordingly
	 * 	- Returns '1' if it has been detected that the ball is out of bounds, otherwise 0
	 */
	updateGame(keys: Record<string, boolean>): number
	{
		if (!this.scene) return 0;

		let isBallOutOfBounds: number = 0;
		let paddle: Paddle | null = null;
		let side: string = "down";

		if (!this.scene.ball || !this.time || !this.scene.leftPadd || !this.scene.rightPadd)
		{
			console.error("objects are missing to run and update the game, can't continue");
			return 0;
		}
		//	Update ball's position according to its direction and velocity
		this.scene.ball.move(this.time);
		//	Check for collisions and invert ball's direction if so
		if (this.scene.ball.update(this.scene.leftPadd, this.scene.rightPadd) == true)
			isBallOutOfBounds = 1;

		//	If a user presses a key, update the position of its padd
		if ((keys["ArrowDown"] || keys["ArrowUp"]))
		{
			paddle = this.scene.rightPadd.paddle;
			if (keys["ArrowUp"])
				side = "up";
		}
		if (!this.robot && (keys["s"] || keys["w"]))
		{
			paddle = this.scene.leftPadd.paddle;
			if (keys["w"])
				side = "up";
		}

		if (this.robot)
			this.scene.leftPadd.paddle.autoMove(this.scene.ball, (Pong.MAP_HEIGHT / 2), this.time);
		if (paddle)
			paddle.move(side, Pong.MAP_HEIGHT / 2, this.time);

		if (this.scene.leftPadd.player && this.scene.rightPadd.player)
			drawScore(this.scene.leftPadd.player.score,  this.scene.rightPadd.player.score);

		return isBallOutOfBounds;
	}

	/**
	 * 	- Start the ball motion after the animation-countdown
	 */
	launch(countdown: number): void
	{
		if (!this.scene || !this.scene.leftPadd?.player || !this.scene.rightPadd?.player) return ;

		if (countdown <= 0 && this.scene && this.scene.ball) {
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
			const timer = createText(countdown.toString(), this.scene.options.ballColor, 60, "200px", "0px", this.gui);
			const animation = createAnimation("timer", "fontSize", keys);

			timer.animations = [animation];
			this.scene.id.beginAnimation(timer, 0, 30, false, 1, () => {
				if (this.gui) this.gui.removeControl(timer);
				countdown--;
				this.launch(countdown);
			});
		}
	}

	/**
	 * 	- Camera tilt animation when the game launches
	 */
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

	endGame(rounds: IRound): void
	{
		if (!rounds || rounds.nbOfRounds < 0) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-STATE: end");

		const index = rounds.nbOfRounds - 2;

		const winnerSpot = document.getElementById('match-results');
		if (winnerSpot && rounds.results && rounds.results[index]?.winner?.name)
		{
			winnerSpot.textContent = `${rounds.results[index].winner.name} wins!`;
			winnerSpot.classList.remove('invisible');
		}
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	handleInput(keys: Record<string, boolean>, rounds: IRound): void {
		//	Resize the game with the window
		window.addEventListener('resize', () => {
			this.engine.resize();
			if (this.scene && this.scene.leftPadd && this.scene.leftPadd.player && this.scene.rightPadd && this.scene.rightPadd.player) {
				drawName(this.scene.leftPadd.player.name, this.scene.rightPadd.player.name, this.scene.options.nbOfPlayers);
				drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
				// drawMatchHistoryTree(this.canvasUI, rounds, this.scene.options.nbOfPlayers);
			}
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
