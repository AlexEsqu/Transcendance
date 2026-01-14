import { Pong } from "./Pong"
import { IOptions } from "./pongData"
import { clearOptions, loadOptions } from "./options"

/************************************************************************************************************/

class GameApp
{
	pong: Pong | null = null;
	startBtnDisplay: HTMLElement | null;
	startBtn: HTMLElement | null;

	constructor(options: IOptions) {
		this.startBtnDisplay = document.getElementById("game-start");
		this.startBtn = document.getElementById('btn-startplay');
		this.setupStartButton();
		try {
			this.pong = new Pong("game-canvas", options, () => this.showStartButton());
			this.pong.goToWaitingRoom();
		} catch (error) {
			console.error(error); // TO DO: better error handling
		}
	}

	play(): void
	{
		requestAnimationFrame(() => {
			if (!this.pong) return;
			this.pong.ready = true;
			const players = this.pong.scene.players;
			for (const player of players)
			{
				this.pong.sendUpdateToGameServer(player.username, 'none', true);
			}
			// this.pong.launch(3);
		});
	}

	setupStartButton(): void
	{
		if (!this.startBtn || !this.startBtnDisplay) {
			console.error("'start button' UI not found");
			return ;
		}

		this.startBtn.addEventListener('click', () => {
			if (this.startBtnDisplay) this.startBtnDisplay.style.display = 'none';
			this.play();
			clearOptions();
		});
	}

	showStartButton(): void
	{
		if (this.startBtnDisplay) this.startBtnDisplay.style.display = 'flex';
	}
}

export function launchPongGame(options: IOptions): void
{
	const startBtnDisplay: HTMLElement | null = document.getElementById("game-start");
	const btnStart: HTMLElement | null = document.getElementById('btn-startplay');

	if (!btnStart || !startBtnDisplay) {
		console.error("'start' UI not found, can't load game");
		return ;
	}

	//	Launch Pong game when user click on start button
	const app = new GameApp(options);
}
