import { JSONRoomAccess, JSONRoomDemand, JSONGameState, JSONInputsUpdate } from './submit.json';
import { fillRoomDemand, getIPlayerFromStr } from './utils';
import { setNotification } from './display';
import { IOptions, PlayerState } from '../game/pongData';
import { Pong } from '../game/Pong';
import { UserState } from '../user/UserState';
import { RegisteredUser, User } from '../user/User';

/************************************************************************************************************/

const WAITING_ROOM_URL: string = `/room/waiting`;
const GAMING_ROOM_URL: string = "/room/gaming";

export class GameApp
{
	private pong: Pong;
	private roomId: number | undefined = undefined;
	private waitingSocket: WebSocket | null = null;
	private gamingSocket: WebSocket | null = null;
	isPlayerReady: boolean = false;
	isOnGamePage: boolean = true;

	constructor(options: IOptions)
	{
		this.pong = new Pong("game-canvas", options, this);
		document.addEventListener('pageLoaded', () => {this.handlePageChange()});
	}

	private getUserToken(): string | null
	{
		const userState: UserState = UserState.getInstance();

		try {
			userState.refreshUser();
		} catch (error) {
			console.error(error);
			return null;
		}

		const user: User | null = userState.getUser();
		if (user)
		{
			userState.refreshToken();
			const token = user instanceof RegisteredUser ? user.accessToken : null;
			return token;
		}
		return null;
	}

	goToWaitingRoom(): Promise<number>
	{
		return new Promise((resolve, reject) => {
			const token: string | null = this.getUserToken();
			if (!token) {
				reject(new Error("Authentication token not found for the current user"));
				return ;
			}

			this.waitingSocket = new WebSocket(`wss://${window.location.host}${WAITING_ROOM_URL}?token=${token}`);
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

				console.log("GAME-APP: connection with game-server");

				//	On socket creation send a demand to the server to add (each) player(s) in a waiting room
				const players = this.pong.scene.players;
				for (const player of players)
				{
					if (player.id !== 0)
					{
						const demand: JSONRoomDemand = fillRoomDemand(options, player);
						this.waitingSocket.send(JSON.stringify(demand));
					}
				}

				//	Set a timeout to avoid waiting until eternity
				setTimeout(() => {
					if (this.roomId === undefined)
					{
						setNotification(true, "No players available to play with you");
						resolve(-1);
					}
				}, 600000);
			};

			//	Wait for the server to manage waiting rooms and assign current user to a gaming room
			this.waitingSocket.onmessage = (event) => {
				const serverMsg: JSONRoomAccess = JSON.parse(event.data);
				console.log("GAME-APP: received message from game-server = ", serverMsg);

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
				reject(new Error("Authentication failed or websocket rejected from the game-server"));
			};

			this.waitingSocket.onclose = (event) => {
				this.waitingSocket = null;
				if (event.code === 1006)
					reject(new Error("Authentication failed or websocket rejected from the game-server"));
				else
					console.log("GAME-APP: You left the waiting room, websocket (for route 'waiting') is closed");
				resolve(this.roomId ?? -1);
			};
		});
	}

	goToGamingRoom(): void
	{
		const token: string | null = this.getUserToken();
		if (!token)
			throw new Error("Authentication token not found for the current user");
		
		this.gamingSocket = new WebSocket(`wss://${window.location.host}${GAMING_ROOM_URL}?token=${token}`);
		if (!this.gamingSocket)
			throw new Error("'gamingSocket' not found");

		this.gamingSocket.onopen = (event) => {
			if (this.roomId === undefined || !this.gamingSocket)
				throw new Error("GAME-APP: can't identify client, impossible to enter the gaming room");

			console.log(`GAME-APP: joining the gaming room(${this.roomId})`);

			//	On socket creation send a message to the game-server to obtain the game info
			this.sendUpdateToGameServer(this.pong.mainPlayerUsername, 'none', this.isPlayerReady);
			//	Start to display (not playing) the game scene
			this.pong.runGame();
		};

		this.gamingSocket.onmessage = (event) => {
			try
			{
				if (this.roomId === undefined || !this.gamingSocket)
					throw new Error("GAME-APP: can't identify client, impossible to process the message received from server");
				if (!this.isOnGamePage)
					this.closeSockets();

				if (event.data.includes("left room"))
				{
					console.log(`GAME-APP: ${event.data}`);
					setNotification(true, "Opponent has left the game, you win");
				}
				else if (event.data.includes("Bad request"))
				{
					console.log(`GAME-APP: ${event.data}`);
					setNotification(true, "Something went wrong while loading the game. Please try again");
					this.pong.scene.state = PlayerState.stop;
					this.closeSockets();
				}
				else
				{
					const gameState: JSONGameState = JSON.parse(event.data);
					// console.log(`GAME-APP: game state from room(${this.roomId}) =`, gameState);
					if (!this.pong.processServerGameState(gameState))
						this.isPlayerReady = false;
				}
			}
			catch (error)
			{
				console.error(error);
				return ;
			}
		};

		this.gamingSocket.onerror = (error) => {
			// console.error(error);
			this.closeSockets();
			console.error("Authentication failed or websocket rejected from the game-server");
		};

		this.gamingSocket.onclose = () => {
			console.log("GAME-APP: You left the game, websocket (for route 'game') is closed");
			this.pong.scene.state = PlayerState.end;
			this.gamingSocket = null;
			return ;
		};
	}

	getReadyToPlay(keys: Record<string, boolean>): void
	{
		// if player isnt ready display "press space bar when you're ready" then listen for inputs
		if (!this.isPlayerReady) {
			setNotification(true, "Press the space bar when you're ready");
			if (keys[" "]) {
				this.isPlayerReady = true;
				if (this.pong.scene.options.matchLocation === 'remote')
					setNotification(true, "Wait for the other player to be ready");

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
		if (!this.isOnGamePage)
			this.closeSockets();
	}

	sendUpdateToGameServer(player: string, action: string, ready: boolean): void
	{
		if (!this.roomId || !this.gamingSocket) {
			console.error("GAME-APP: Error, can't send update to game server because elements are missing");
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

	closeSockets(): void
	{
		if (this.waitingSocket !== null)
		{
			this.waitingSocket.close();
			this.waitingSocket = null;
		}
		if (this.gamingSocket !== null)
		{
			this.gamingSocket.close();
			this.gamingSocket = null;
		}
		console.log("GAME-APP: sockets are closed");
	}

	handlePageChange(): void
	{
		this.isOnGamePage = false;
	}
}

export async function launchPongGame(options: IOptions): Promise<void>
{
	console.clear();
	try {
		const app = new GameApp(options);
		const roomId: number = await app.goToWaitingRoom();
		if (roomId === -1)
		{
			setNotification(true, "Something went wrong while entering the game. Please try again");
			app.closeSockets();
			return ;
		}
		setTimeout(() => { 
			try {
				app.goToGamingRoom(); 
			} catch (error) {
				console.error(error);
				setNotification(true, "Something went wrong while entering the game. Please try again");
				app.closeSockets();
			}
		}, 1000);
	} catch (error) {
		console.error(error);
		setNotification(true, "Something went wrong while loading the game. Please try again");
	}
}
