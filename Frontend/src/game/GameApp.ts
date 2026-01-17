import { JSONRoomAccess, JSONRoomDemand, JSONGameState, JSONInputsUpdate } from './submit.json';
import { fillRoomDemand, getIPlayerFromStr } from './utils';
import { setNotification } from './display';
import { IOptions, PlayerState } from '../game/pongData';
import { Pong } from '../game/Pong';

/************************************************************************************************************/

export class GameApp
{
	pong: Pong;
	roomId: number | undefined = undefined;
	waitingSocket: WebSocket | null = null;
	gamingSocket: WebSocket | null = null;
	isPlayerReady: boolean = false;

	constructor(options: IOptions)
	{
		this.pong = new Pong("game-canvas", options, this);
	}

	goToWaitingRoom(): Promise<number>
	{
		return new Promise((resolve, reject) => {
			this.waitingSocket = new WebSocket(`wss://${window.location.host}${Pong.WAITING_ROOM_URL}`);
			if (!this.waitingSocket) {
				reject(new Error("'waitingSocket' creation failed"));
				return ;
			}

			const options: IOptions = this.pong.scene.options;

			this.waitingSocket.onopen = (e) => {
				if (!this.waitingSocket || !this.pong.scene) {
					reject(new Error("elements not found, can't go to waiting room"));
					return ;
				}

				console.log("GAME-FRONT: connection with game-server");
				
				//	On socket creation send a demand to the server to add (each) player(s) in a waiting room
				const players = this.pong.scene.players;
				for (const player of players)
				{
					if (player.id !== 0)
					{
						const demand: JSONRoomDemand = fillRoomDemand(options.matchLocation, options.nbOfPlayers, player);
						this.waitingSocket.send(JSON.stringify(demand));
					}
				}
			};

			//	Wait for the server to manage waiting rooms and assign current user to a gaming room
			this.waitingSocket.onmessage = (event) => {
				const serverMsg: JSONRoomAccess = JSON.parse(event.data);
				console.log("GAME-FRONT: received message from game-server = ", serverMsg);

				//	If game server sends a valid roomId and that no roomId was already settled save data and close websocket
				if (serverMsg.roomId !== undefined && this.roomId === undefined) {
					this.pong.scene.players = getIPlayerFromStr(serverMsg.players);
					this.roomId = serverMsg.roomId;
					this.waitingSocket?.close();
					this.waitingSocket = null;
					//	We can leave waiting room
					resolve(this.roomId);
				}
			};

			this.waitingSocket.onerror = (error) => {
				// console.error(error);
				this.waitingSocket?.close();
				this.waitingSocket = null;
				reject(new Error(error.toString()));
			};

			this.waitingSocket.onclose = () => {
				console.log("GAME-FRONT: You left the waiting room, websocket (for route 'waiting') is closed");
				this.waitingSocket?.close();
				this.waitingSocket = null;
				resolve(this.roomId ?? -1);
			};
		});
	}

	goToGamingRoom(): void
	{
		setTimeout(() => {
			this.gamingSocket = new WebSocket(`wss://${window.location.host}${Pong.GAMING_ROOM_URL}`);
			if (!this.gamingSocket)
				throw new Error("'gamingSocket' not found");
	
			this.gamingSocket.onopen = (event) => {
				if (this.roomId === undefined || !this.gamingSocket) {
					throw new Error("GAME-FRONT: can't identify client, impossible to enter the gaming room");
				}
	
				console.log(`GAME-FRONT: joining the gaming room(${this.roomId})`);
				// this.pong.scene.state = PlayerState.waiting;
				this.pong.scene.state = this.pong.scene.options.matchLocation === 'local' ? PlayerState.opening : PlayerState.waiting;
				this.pong.runGame();
				console.log(this.pong.scene.players);
			};
	
			this.gamingSocket.onmessage = (event) => {
				try
				{
					if (this.roomId === undefined || !this.gamingSocket)
						throw new Error("GAME-FRONT: can't identify client, impossible to process the message received from server");

						const gameState: JSONGameState = JSON.parse(event.data);
						// console.log(`GAME-FRONT: game state from room(${this.roomId}) =`, gameState);
						if (!this.pong.processServerGameState(gameState))
							this.isPlayerReady = false;
	
				}
				catch (error)
				{
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
				console.log("GAME-FRONT: You left the game, websocket (for route 'game') is closed");
				this.pong.scene.state = PlayerState.stop;
			};
		}, 1000);
	}

	getReadyToPlay(keys: Record<string, boolean>): void
	{
		// if player isnt ready display "press space bar when you're ready" then listen for inputs
		if (!this.isPlayerReady) {
			setNotification(true, "Press the space bar when you're ready");
			if (keys[" "]) {
				this.isPlayerReady = true;
				if (this.pong.scene.options.matchLocation === 'remote')
					setNotification(true, "Wait for the other player(s) to be ready");
				
				//	Notify the server that player(s) is ready to play
				if (this.pong.scene.options.matchLocation === 'local')
				{
					const players = this.pong.scene.players;
					for (const player of players)
					{
						this.sendUpdateToGameServer(player.username, 'none', true);
					}
				}
				else
					this.sendUpdateToGameServer(this.pong.mainPlayerUsername, 'none', true);
			}
		}
	}

	sendUpdateToGameServer(player: string, action: string, ready: boolean): void
	{
		if (!this.roomId || !this.gamingSocket) {
			console.error("GAME-FRONT: Error, can't send update to game server because elements are missing");
			return ;
		}

		if (player === 'Nan')
			return ;

		const gameUpdateMsg: JSONInputsUpdate = {
			username: player,
			roomId: this.roomId,
			ready: ready,
			state: this.pong.scene.state,
			move: action
		};

		this.gamingSocket.send(JSON.stringify(gameUpdateMsg));
	}
}

export async function launchPongGame(options: IOptions): Promise<void>
{
	const element = document.getElementById('player-ready-input') as HTMLElement;
	if (element)
		element.style.display = 'none';

	try {
		const app = new GameApp(options);
		await app.goToWaitingRoom();
		app.goToGamingRoom();
	} catch (error) {
		console.error(error); // TO DO: better error handling
	}
}
