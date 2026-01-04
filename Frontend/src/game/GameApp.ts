import { Pong } from "../game/Pong"
import { IOptions } from "../game/Data"
import { clearOptions, loadOptions } from "./options"

import gameHtml from '../pages/game.html?raw'
import optionsHtml from '../pages/options.html?raw'
import { userState } from "../app"

class GameApp {
	pong: Pong;
	startBtnDisplay: HTMLElement | null;
	startBtn: HTMLElement | null;

	constructor(options: IOptions) {
		this.startBtnDisplay = document.getElementById("game-start");
		this.startBtn = document.getElementById('btn-startplay');
		this.setupStartButton();
		
		this.pong = new Pong("game-canvas", options, () => this.showStartButton());
		this.pong.runGame();
	}

	play() {
		requestAnimationFrame(() => {
			this.pong.launch(3);
		});
	}

	setupStartButton() {
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

	showStartButton() {
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
