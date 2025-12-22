import { Pong } from "../game/Pong"
import { IOptions, Level } from "../game/Data"
import gameHtml from '../pages/game.html?raw'
import optionsHtml from '../pages/options.html?raw'

import { clearOptions, loadOptions } from "./options"
import { userState } from "../app"

class App {
	pong: Pong;
	startBtnDisplay: HTMLElement | null;
	startBtn: HTMLElement | null;

	constructor(canvas : HTMLElement, options: IOptions) {
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

	const player1Name = document.getElementById('player1-name');
	const player2Name = document.getElementById('player2-name');
	if (player1Name)
		player1Name.textContent = options.players[0] || 'You';
	if (player2Name)
		player2Name.textContent = options.players[1] || "Robot";

	//	Launch Pong game when user click on start button
	const gameWindow = document.getElementById("game-canvas") as HTMLCanvasElement;
	gameWindow.width = window.innerWidth;
	gameWindow.height = window.innerHeight;
	if (!gameWindow.getContext) {
		console.error("canvas context not found");
		return ;
	}

	const app = new App(gameWindow, options);
}
