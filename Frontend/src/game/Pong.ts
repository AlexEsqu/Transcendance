import { IOptions, IPaddle, IScene, IPlayer, PlayerState } from "./pongData";
import { openingAnimation, loadGame, drawScore, drawName } from './Graphics';
import { getCanvasConfig, getPlayers, processNewPlayerState, assignPlayer } from './utils';
import { JSONGameState } from './submit.json';
import { setNotification } from './display';
import { GameApp } from './GameApp';
import { Engine } from '@babylonjs/core';

/************************************************************************************************************/

export class Pong
{

	static WAITING_ROOM_URL = `/room/waiting`;
	static GAMING_ROOM_URL = "/room/gaming";

	gameApp: GameApp;
	canvas: HTMLCanvasElement;
	engine: Engine | null = null;
	scene: IScene;
	round: number = 0;
	mainPlayerUsername: string;
	results: { winner: string, loser: string } | undefined = undefined;

	constructor(canvasId: string, options: IOptions, app: GameApp)
	{
		this.gameApp = app;
		this.canvas = getCanvasConfig(canvasId);
		this.engine = new Engine(this.canvas, true);
		if (!this.engine)
			throw new Error("'engine' creation failed");

		const players = getPlayers(options.players, options.paddColors, options.nbOfPlayers, options.matchLocation);
		console.log(players);
		if (!players)
			throw new Error("players are not found");

		const scene = loadGame(this.engine, this.canvas, options);
		if (!scene)
			throw new Error("'scene' creation failed");

		this.scene = scene;
		this.scene.players = players;
		this.mainPlayerUsername = players[0].username;
		this.scene.state = options.matchLocation === 'local' ? PlayerState.opening : PlayerState.waiting;
	}

	runGame(): void
	{
		if (!this.engine || !this.scene.id) {
			console.error("error occured while loading 'Pong' game");
			return ;
		}

		const keys: Record<string, boolean> = {};

		//	Manage user input and update data before render
		this.processInputs(keys);
		this.scene.id.registerBeforeRender(() => {
			// console.log(`GAME-FRONT-STATE: ${this.scene.state}`);
			this.stateBasedAction(this.scene.state, keys);
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (!this.scene.id || this.scene.state === PlayerState.stop || !this.gameApp.gamingSocket)
			{
				if (this.engine)
					this.engine.stopRenderLoop();
				return ;
			}
			this.scene.id.render();

			if (this.scene.leftPadd.player && this.scene.rightPadd.player)
			{
				drawName(this.scene.leftPadd.player.username, this.scene.rightPadd.player.username, this.round);
				drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
			}
		});
	}

	stateBasedAction(state: PlayerState, keys: Record<string, boolean>): void
	{
		switch (state)
		{
			case PlayerState.opening:
				openingAnimation(this.scene);
				break ;

			case PlayerState.play:
				this.updateGame(keys);
				break ;

			case PlayerState.waiting:
				this.gameApp.getReadyToPlay(keys);
				break ;

			case PlayerState.end:
				this.endGame();
				break ;
			
			case PlayerState.stop:
				this.gameApp.gamingSocket?.close();
				this.gameApp.gamingSocket = null;
				break ;

			default:
				break ;
		}
	}

	updateGame(keys: Record<string, boolean>): void
	{
		setNotification(false, undefined);

		const rightPadd: IPaddle = this.scene.rightPadd;
		const leftPadd: IPaddle = this.scene.leftPadd;

		//	If a user presses a key, ask the server to update paddle's position
		if (this.scene.options.matchLocation === 'local')
		{
			if (keys["ArrowDown"])
				this.gameApp.sendUpdateToGameServer(rightPadd.player?.username ?? 'NaN', 'down', true);
			if (keys["ArrowUp"])
				this.gameApp.sendUpdateToGameServer(rightPadd.player?.username ?? 'NaN', 'up', true);
			if (keys["s"])
				this.gameApp.sendUpdateToGameServer(leftPadd.player?.username ?? 'NaN', 'down', true);
			if (keys["w"])
				this.gameApp.sendUpdateToGameServer(leftPadd.player?.username ?? 'NaN', 'up', true);
			return ;
		}

		//	Code bellow is executed only in 'remote' case
		let mainPlayerPadd: IPaddle;
		if (rightPadd.player?.username === this.mainPlayerUsername)
			mainPlayerPadd = rightPadd;
		else
			mainPlayerPadd = leftPadd;
		//	Update paddle's position (remote case)
		if (keys["ArrowDown"])
			this.gameApp.sendUpdateToGameServer(mainPlayerPadd.player?.username ?? 'NaN', 'down', true);
		if (keys["ArrowUp"])
			this.gameApp.sendUpdateToGameServer(mainPlayerPadd.player?.username ?? 'NaN', 'up', true);
	}

	processServerGameState(gameState: JSONGameState): boolean
	{
		this.scene.state = processNewPlayerState(gameState.state);

		if (this.scene.ball)
		{
			this.scene.ball.position.x = gameState.ball.x;
			this.scene.ball.position.z = gameState.ball.z;
		}

		if (this.round !== gameState.round || !this.scene.leftPadd.player || !this.scene.rightPadd.player)
		{
			this.round = gameState.round;
			this.scene.leftPadd.player = assignPlayer(gameState, this.scene.players, 'left');
			this.scene.rightPadd.player = assignPlayer(gameState, this.scene.players, 'right');
			return false;
		}
		this.updatePaddleInfo(this.scene.leftPadd, gameState.leftPaddPos, gameState.leftPaddScore);
		this.updatePaddleInfo(this.scene.rightPadd, gameState.rightPaddPos, gameState.rightPaddScore);

		if (gameState.results !== undefined)
			this.results = gameState.results;

		return true;
	}

	updatePaddleInfo(paddle: IPaddle, newPos: number, newScore: number): void
	{
		if (paddle.mesh)
			paddle.mesh.position.z = newPos;

		if (paddle.player)
			paddle.player.score = newScore;
	}

	endGame(): void
	{
		console.log("GAME-FRONT: end");

		if (this.scene.leftPadd.player && this.scene.rightPadd.player)
			drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
		
		if (this.results === undefined) {
			console.error("results of matches are lost");
			return ;
		}

		const winnerSpot = document.getElementById('match-results');
		if (winnerSpot && this.results.winner)
		{
			winnerSpot.textContent = `${this.results.winner} wins!`;
			winnerSpot.classList.remove('invisible');
		}
		this.scene.state = PlayerState.stop;
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	processInputs(keys: Record<string, boolean>): void
	{
		//	Resize the game with the window
		window.addEventListener('resize', () => {
			if (this.engine)
				this.engine.resize();
			// if (this.scene.leftPadd && this.scene.leftPadd.player && this.scene.rightPadd && this.scene.rightPadd.player)
			// {
			// 	drawName(this.scene.leftPadd.player.username, this.scene.rightPadd.player.username, this.scene.options.nbOfPlayers);
			// 	drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
			// }
		});

		//	Shift+Ctrl+Alt+I == Hide/show the Inspector
		window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this.scene.id && this.scene.id.debugLayer.isVisible()) {
                    this.scene.id.debugLayer.hide();
                } else if (this.scene.id) {
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