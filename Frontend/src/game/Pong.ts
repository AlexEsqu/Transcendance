import { JSONInputsUpdate, JSONGameState, JSONRoomAccess, JSONRoomDemand } from './submit.json';
import { IOptions, IScene, IResult, PlayerState, ServerState } from "./pongData";
import { createText, createAnimation, loadGame, drawScore, drawName } from './Graphics';
import { getCanvasConfig, getPlayers, fillRoomDemand, processNewPlayerState, assignPlayers, getIPlayerFromStr } from './utils';
import { Engine } from '@babylonjs/core';

/************************************************************************************************************/

export class Pong
{

	static WAITING_ROOM_URL = `/room/waiting`;
	static GAMING_ROOM_URL = "/room/gaming";

	canvas: HTMLCanvasElement;
	engine: Engine | null = null;
	scene: IScene;
	waitingSocket: WebSocket | null = null;
	gamingSocket: WebSocket | null = null;
	roomId: number | undefined = undefined;
	round: number = 0;
	isPlayerReady: boolean = false;
	timestamp: number = 0;

	constructor(canvasId: string, options: IOptions)
	{
		this.canvas = getCanvasConfig(canvasId);
		this.engine = new Engine(this.canvas, true);
		if (!this.engine)
			throw new Error("'engine' creation failed");
		const players = getPlayers(options.players, options.paddColors, options.nbOfPlayers, options.matchLocation);
		if (!players)
			throw new Error("players are not found");
		const scene = loadGame(this.engine, this.canvas, options);
		if (!scene)
			throw new Error("'scene' creation failed");
		this.scene = scene;
		this.scene.players = players;
		this.scene.state = PlayerState.opening;
		this.waitingSocket = new WebSocket(`wss://${window.location.host}${Pong.WAITING_ROOM_URL}`);
		if (!this.waitingSocket)
			throw new Error("'waitingSocket' creation failed");
		this.timestamp = Date.now();
	}

	goToWaitingRoom(): void
	{
		if (!this.waitingSocket || !this.scene)
			throw new Error("can't go to waiting room, elements are missing to continue");

		const options: IOptions = this.scene.options;

		//	On socket creation send a message to the server to be added in a waiting room
		this.waitingSocket.onopen = (e) => {
			if (!this.waitingSocket || !this.scene)
				throw new Error("elements not found, can't go to waiting room");
			console.log("GAME-FRONT: connection with game-server");
			const players = this.scene.players;
			for (const player of players)
			{
				if (player.id !== 0) {
					const demand: JSONRoomDemand = fillRoomDemand(options.matchLocation, options.nbOfPlayers, player);
					this.waitingSocket.send(JSON.stringify(demand));
				}
			}
		};

		//	Wait for the server to manage waiting rooms and assign current user to a gaming room
		this.waitingSocket.onmessage = (event) => {
			const serverMsg: JSONRoomAccess = JSON.parse(event.data);
			console.log("GAME-FRONT: received message from game-server = ", serverMsg);

			//	If game server sends a valid roomId and that no roomId was already settled
			if (this.roomId === undefined && serverMsg.roomId !== undefined) {
				this.scene.players = getIPlayerFromStr(serverMsg.players);
				this.roomId = serverMsg.roomId;
				this.waitingSocket?.close();
				this.waitingSocket = null;
				this.goToGamingRoom();
			}
		};

		this.waitingSocket.onerror = (error) => {
			// console.error(error);
			this.waitingSocket?.close();
			this.waitingSocket = null;
			throw new Error(error.toString());
		};

		this.waitingSocket.onclose = () => {
			console.log("GAME-FRONT: websocket (for route 'waiting') is closed");
		};
	}

	goToGamingRoom(): void
	{
		setTimeout(() => {
			this.gamingSocket = new WebSocket(`wss://${window.location.host}${Pong.GAMING_ROOM_URL}`);
			if (!this.gamingSocket)
				throw new Error("'gamingSocket' not found");
	
			this.gamingSocket.onopen = (event) => {
				if (this.roomId === undefined || !this.gamingSocket) {
					console.error("GAME-FRONT: can't identify client, impossible to enter the gaming room");
					throw new Error("GAME-FRONT: can't identify client, impossible to enter the gaming room");
				}
	
				console.log(`GAME-FRONT: joining the gaming room(${this.roomId})`);
				this.sendUpdateToGameServer(this.scene.players[0].username, 'none', false);
				this.scene.state = PlayerState.opening;
				this.runGame();
			};
	
			this.gamingSocket.onmessage = (event) => {
				try {
					if (this.roomId === undefined || !this.gamingSocket)
						throw new Error("GAME-FRONT: can't identify client, impossible to enter the gaming room");
		
					const gameState: JSONGameState = JSON.parse(event.data);
					this.processNewGameState(gameState);
					// console.log(`GAME-FRONT: game state from room(${this.roomId}) =`, gameState);
	
				} catch (error) {
					console.error(error);
					return ;
				}
			};
	
			this.gamingSocket.onerror = (error) => {
				// console.error(error);
				this.gamingSocket?.close();
				this.gamingSocket = null;
				throw new Error(error.toString());
			};

			this.gamingSocket.onclose = () => {
				console.log("GAME-FRONT: websocket (for route 'game') is closed");
			};
		}, 100);
	}

	runGame(): void
	{
		if (!this.engine || !this.scene.id) {
			console.error("error occured while loading 'Pong' game");
			return ;
		}

		const keys: Record<string, boolean> = {};
		let result: IResult = { winner: null, maxScore: 0, loser: null, minScore: 0};

		//	Manage user input and update data before render
		this.handleInput(keys);
		this.scene.id.registerBeforeRender(() => {
			// console.log(`GAME-FRONT-STATE: ${this.scene.state}`);
			this.stateBasedScene(this.scene.state, result, keys);
			// this.timestamp = Date.now();
		});

		//	Rendering loop
		this.engine.runRenderLoop(() => {
			if (!this.engine)
				return ;
			if (!this.scene || !this.scene.id || this.scene.state === PlayerState.stop || !this.gamingSocket) {
				this.engine.stopRenderLoop();
				return ;
			}
			this.scene.id.render();
			if (this.scene.leftPadd.player && this.scene.rightPadd.player) {
				drawName(this.scene.leftPadd.player.username, this.scene.rightPadd.player.username, this.round);
				drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
			}
		});
	}

	stateBasedScene(state: PlayerState, results: IResult | undefined, keys: Record<string, boolean>): void
	{
		switch (state)
		{
			case PlayerState.opening:
				this.opening();
				break ;

			case PlayerState.play:
				this.updateGame(keys);
				break ;

			case PlayerState.waiting:
				this.getReadyToPlay(keys);
				break ;

			case PlayerState.end:
				this.endGame(results);
				break ;
			
			case PlayerState.stop:
				this.gamingSocket?.close();
				this.gamingSocket = null;
				break ;

			default:
				break ;
		}
	}

	updateGame(keys: Record<string, boolean>): void
	{
		let player: string | undefined;
		let action: string = 'none';

		//	If a user presses a key, ask the server to update paddle's position
		if (keys["ArrowDown"]) {
			player = this.scene.rightPadd?.player?.username;
			action = 'down';
		} else if (keys["ArrowUp"]) {
			player = this.scene.rightPadd?.player?.username;
			action = 'up';
		}

		if (action !== 'none')
			this.sendUpdateToGameServer(player ?? 'NaN', action, true);

		if (this.scene.options.matchLocation === 'local') {
			if (keys["s"]) {
				player = this.scene.leftPadd?.player?.username;
				action = 'down';
			} else if (keys["w"]) {
				player = this.scene.leftPadd?.player?.username;
				action = 'up';
			}
			if (action !== 'none')
				this.sendUpdateToGameServer(player ?? 'NaN', action, true);
		}
	}

	getReadyToPlay(keys: Record<string, boolean>): void
	{
		const element = document.getElementById('player-ready-input') as HTMLElement;
		if (!element)
			return ;

		// if player isnt ready display "press space bar when you're ready" then listen for inputs
		if (!this.isPlayerReady) {

			element.style.display = 'flex';

			if (keys[" "]) {
				this.isPlayerReady = true;
				element.style.display = 'none';
				
				//	Notify the server that player(s) is ready to play
				const players = this.scene.players;
				for (const player of players)
				{
					this.sendUpdateToGameServer(player.username, 'none', true);
				}
			}
		}
	}

	processNewGameState(gameState: JSONGameState): void
	{
		this.timestamp = gameState.timestamp;
		this.scene.state = processNewPlayerState(gameState.state);

		if (this.scene.ball) {
			this.scene.ball.position.x = gameState.ball.x;
			this.scene.ball.position.z = gameState.ball.z;
		}

		if (this.round !== gameState.round || !this.scene.leftPadd.player || !this.scene.rightPadd.player) {
			this.round = gameState.round;
			this.scene.leftPadd.player = assignPlayers(gameState, this.scene.players, 'left');
			this.scene.rightPadd.player = assignPlayers(gameState, this.scene.players, 'right');
			this.isPlayerReady = false;
		}

		if (this.scene.leftPadd.mesh && this.scene.leftPadd.player) {
			this.scene.leftPadd.mesh.position.z = gameState.leftPaddPos;
			this.scene.leftPadd.player.score = gameState.leftPaddScore;
		}

		if (this.scene.rightPadd.mesh && this.scene.rightPadd.player) {
			this.scene.rightPadd.mesh.position.z = gameState.rightPaddPos;
			this.scene.rightPadd.player.score = gameState.rightPaddScore;
		}
	}

	sendUpdateToGameServer(player: string, action: string, ready: boolean): void
	{
		if (!this.roomId || !this.gamingSocket || !this.scene) {
			console.error("GAME-FRONT: Error, can't send update to game server because elements are missing");
			return ;
		}

		const gameUpdateMsg: JSONInputsUpdate = {
			username: player,
			roomId: this.roomId,
			ready: ready,
			state: this.scene.state,
			move: action
		};

		this.gamingSocket.send(JSON.stringify(gameUpdateMsg));
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

		if (this.scene.camera && this.scene.id) {
			this.scene.camera.animations = [];
			this.scene.camera.animations.push(animation);
			this.scene.id.beginAnimation(this.scene.camera, 0, 60, false);
			this.scene.state = PlayerState.waiting;
		}
	}

	endGame(result: IResult | undefined): void
	{
		if (!result || result === undefined) {
			console.error("results of matches are lost");
			return ;
		}
		console.log("GAME-FRONT: end");

		if (this.scene.leftPadd.player && this.scene.rightPadd.player)
			drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
		
		const winnerSpot = document.getElementById('match-results');
		if (winnerSpot && result.winner?.username)
		{
			winnerSpot.textContent = `${result.winner?.username} wins!`;
			winnerSpot.classList.remove('invisible');
		}
		this.scene.state = PlayerState.stop;
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
			if (this.scene.leftPadd && this.scene.leftPadd.player && this.scene.rightPadd && this.scene.rightPadd.player)
			{
				drawName(this.scene.leftPadd.player.username, this.scene.rightPadd.player.username, this.scene.options.nbOfPlayers);
				drawScore(this.scene.leftPadd.player.score, this.scene.rightPadd.player.score);
			}
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
			if (evt.key === ' ' && !this.isPlayerReady)
				keys[evt.key] = true;
		});
	}
}