import { JSONInputsUpdate, JSONGameState, JSONRoomAccess, JSONAwaitingAccess } from './submit.json';
import { State, IPlayer, IOptions, IScene, IResult } from "./pongData";
import { createText, createAnimation, loadGame, drawScore, drawName } from './Graphics';
import { getCanvasConfig, getPlayers, fillWaitingRoomRequest, getPlayersId } from './utils';
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Engine } from '@babylonjs/core';

/************************************************************************************************************/

export class Pong
{

	static WAITING_ROOM_URL = "ws://localhost:4001/room/waiting";
	static GAMING_ROOM_URL = "ws://localhost:4001/room/gaming";

	canvas: HTMLCanvasElement;
	engine: Engine | null = null;
	scene: IScene | null = null;
	gui: AdvancedDynamicTexture | null = null;
	isRunning: boolean;
	waitingSocket: WebSocket | null = null;
	gamingSocket: WebSocket | null = null;
	roomId: number | undefined = undefined;
	timestamp: number = 0;
	onNewRound?: () => void;

	constructor(canvasId: string, options: IOptions, onNewRound?: () => void)
	{
		this.canvas = getCanvasConfig(canvasId);
		this.engine = new Engine(this.canvas, true);
		if (!this.engine)
			throw new Error("'engine' creation failed");
		this.scene = loadGame(this.engine, this.canvas, options);
		if (!this.scene)
			throw new Error("'scene' creation failed");
		this.scene.players = getPlayers(options.players, options.nbOfPlayers);
		this.scene.state = State.waiting;
		this.onNewRound = onNewRound;
		this.isRunning = false;
		this.waitingSocket = new WebSocket(Pong.WAITING_ROOM_URL);
		if (!this.waitingSocket)
			throw new Error("'waitingSocket' creation failed");
		this.timestamp = Date.now();
	}

	goToWaitingRoom(): void
	{
		if (!this.waitingSocket)
			throw new Error("'waitingSocket' not found");

		const request: JSONAwaitingAccess = fillWaitingRoomRequest(this.scene?.options.matchLocation,
															this.scene?.options.nbOfPlayers, undefined);

		//	On socket creation send a message to the server to be added in a waiting room
		this.waitingSocket.onopen = (e) => {
			if (!this.waitingSocket)
				throw new Error("'waitingSocket' not found");
			console.log("GAME-FRONT: connection with game-server");
			this.waitingSocket.send(JSON.stringify(request));
		}

		//	Wait for the server to manage waiting rooms and assign current user to a gaming room
		this.waitingSocket.onmessage = (e) => {
			const serverMsg: JSONRoomAccess = JSON.parse(e.data);
			console.log(`GAME-FRONT: received message from server =`, serverMsg);
			
			// console.log(`roomID ${this.roomId}`);
			// console.log(`state.roomID ${serverMsg.roomId}`);
			if (this.roomId === undefined && serverMsg.roomId !== undefined) {
				this.roomId = serverMsg.roomId;
				this.gamingSocket = new WebSocket(Pong.GAMING_ROOM_URL);
				this.goToGamingRoom();
			}
		}

		this.waitingSocket.onerror = (error) => {
			// console.error(error);
			throw new Error(error.toString());
		}
	}

	goToGamingRoom(): void
	{
		if (!this.gamingSocket)
			throw new Error("'gamingSocket' not found");
			
		this.gamingSocket.onopen = (e) => {
			if (this.roomId === undefined)
				throw new Error("'roomId' is undefined, can't enter to gaming room");
			if (!this.gamingSocket)
				throw new Error("'gamingSocket' not found");

			console.log(`GAME-FRONT: joining the gaming room(${this.roomId})`);
			const joinMsg = {
				id: this.playerId ?? Date.now(),
				roomId: this.roomId,
				ready: false,
			};
			this.gamingSocket.send(JSON.stringify(joinMsg));
			this.runGame();
		}

		this.gamingSocket.onerror = (error) => {
			// console.error(error);
			throw new Error(error.toString());
		}
	}

	runGame(): void
	{
		if (!this.engine || !this.scene || !this.scene.id) {
			console.error("error occured while loading 'Pong' game");
			return ;
		}

		const keys: Record<string, boolean> = {};
		let result: IResult = { winner: null, maxScore: 0, loser: null, minScore: 0};
		let isNewRound: boolean = true;

		//	Manage user input and update data before render
		this.handleInput(keys);
		this.scene.id.registerBeforeRender(() => {
			if (!this.scene)
				return ;
			console.log(`GAME-FRONT-STATE: ${this.scene.state}`);
			if (this.scene.state === State.opening)
				this.opening();
			if (isNewRound && this.scene.state === State.launch)
				this.launch(3);
			if (this.scene.state === State.end)
				this.endGame(result);
			if (this.scene.state === State.play)
				isNewRound = this.updateGame(keys);
			isNewRound = false;
			this.timestamp = Date.now();
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (!this.engine)
				return ;
			if (!this.scene || !this.scene.id || this.scene.state === State.stop) {
				this.engine.stopRenderLoop();
				return ;
			}

			this.scene.id.render();
		});
	}

	updateGame(keys: Record<string, boolean>): boolean
	{
		if (!this.scene) return false;

		let isBallOutOfBounds: boolean = false;
		let player: number | undefined = this.playerId ?? 42;
		let action: string = 'none';

		//	If a user presses a key, ask the server to update paddle's position
		if (keys["ArrowDown"]) {
			player = this.scene.rightPadd?.player?.id;
			action = 'down';
		} else if (keys["ArrowUp"]) {
			player = this.scene.rightPadd?.player?.id;
			action = 'up';
		}

		if (action !== 'none')
			this.sendUpdateToGameServer(player ?? this.playerId, action, true);

		if (this.scene.options.matchLocation === 'local') {
			if (keys["s"]) {
				player = this.scene.leftPadd?.player?.id;
				action = 'down';
			} else if (keys["w"]) {
				player = this.scene.leftPadd?.player?.id;
				action = 'up';
			}
		}

		const newGameState: JSONGameState | null = this.getGameStateUpdated();
		if (!newGameState)
			return isBallOutOfBounds;

		this.processNewGameState(newGameState);

		return isBallOutOfBounds;
	}

	processNewGameState(gameState: JSONGameState): void
	{
		if (!this.scene)
			return ;

		this.scene.state = gameState.state as State;
		this.timestamp = gameState.timestamp;
		if (this.scene.leftPadd && this.scene.leftPadd.mesh && this.scene.leftPadd.player) {
			this.scene.leftPadd.mesh.position.z = gameState.leftPaddPos;
			this.scene.leftPadd.player.score = gameState.leftPaddScore;
		}
		if (this.scene.rightPadd && this.scene.rightPadd.mesh && this.scene.rightPadd.player) {
			this.scene.rightPadd.mesh.position.z = gameState.rightPaddPos;
			this.scene.rightPadd.player.score = gameState.rightPaddScore;
		}
		if (this.scene.ball) {
			this.scene.ball.position.x = gameState.ball.x;
			this.scene.ball.position.z = gameState.ball.z;
		}
	}

	sendUpdateToGameServer(player: number, action: string, ready: boolean): void
	{
		if (!this.roomId || !this.gamingSocket || !this.scene) {
			console.error("GAME-FRONT: Error, can't send update to game server because elements are missing");
			return ;
		}

		const gameUpdateMsg: JSONInputsUpdate = {
			id: player,
			roomId: this.roomId,
			ready: ready,
			state: this.scene.state,
			move: action
		};

		this.gamingSocket.send(JSON.stringify(gameUpdateMsg));
	}

	getGameStateUpdated(): JSONGameState | null
	{
		if (!this.gamingSocket)
			throw new Error("'gamingSocket' not found");

		this.gamingSocket.onmessage = (e) => {
			if (this.roomId === undefined)
				throw new Error("'roomId' is undefined, can't enter to gaming room");
			if (!this.gamingSocket)
				throw new Error("'gamingSocket' not found");

			const gameState: JSONGameState = JSON.parse(e.data);
			console.log(`GAME-FRONT: game state from room(${this.roomId}) =`, gameState);
			return gameState;
		}
		return null;
	}

	/**
	 * 	- Start the ball motion after the animation-countdown
	 */
	launch(countdown: number): void
	{
		if (!this.scene || !this.scene.leftPadd?.player || !this.scene.rightPadd?.player) return ;

		if (countdown <= 0 && this.scene && this.scene.ball) {
			this.scene.state = State.play;
			this.isRunning = true;
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
		console.log("GAME-FRONT: opening");
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

	endGame(result: IResult): void
	{
		if (!result) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-FRONT: end");

		const winnerSpot = document.getElementById('match-results');
		if (winnerSpot && result.winner?.name)
		{
			winnerSpot.textContent = `${result.winner?.name} wins!`;
			winnerSpot.classList.remove('invisible');
		}
	}

	/**
	 * 	- Listens to window inputs for each frame.
	 * 	- Saves keys status (on/off) to update scene objects accordingly.
	 */
	handleInput(keys: Record<string, boolean>): void
	{
		//	Resize the game with the window
		window.addEventListener('resize', () => {
		if (this.engine)
			this.engine.resize();
		if (this.scene && this.scene.leftPadd && this.scene.leftPadd.player && this.scene.rightPadd && this.scene.rightPadd.player)
		{
			drawName(this.scene.leftPadd.player.name, this.scene.rightPadd.player.name, this.scene.options.nbOfPlayers);
			drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
		}

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
		});
	}
}