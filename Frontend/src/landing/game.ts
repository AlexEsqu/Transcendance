import { Pong } from "../game/Pong"
import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'

export enum Level {
	easy,
	medium,
	hard,
};

export interface IOptions {
	level: Level;
	nbOfPlayer: number;
};

class App {
	pong: Pong;
	constructor(canvas : HTMLElement, options: IOptions) {
		//	Hard coded users id -> must change later after user auth !!!!!!!
		this.pong = new Pong("game-canvas", 1, 2, options);
		this.pong.loadGame();
	}

	play() {
		requestAnimationFrame(() => {
			this.pong.startPlay();
		});
	}
}

function launchPongGame(options: IOptions): void {
	//	Display start button and game window
	document.body.insertAdjacentHTML("beforeend", gameHtml);

	const startDisplay: HTMLElement = document.getElementById("game-start");
	const btnStart: HTMLElement = document.getElementById('btn-startplay');
	
	if (!btnStart || !startDisplay) {
		console.error("'start' UI not found, can't load game");
		return ;
	}

	//	Launch Pong game when user click on start button
	const gameWindow = document.getElementById("game-canvas");
	const app = new App(gameWindow, options);
	btnStart.addEventListener('click', (e) => {
		startDisplay.remove();
		app.play();
	});
}

function selectGameOptions(): Promise<IOptions> {
	document.body.insertAdjacentHTML("beforeend", optionsHtml);

	const optionsDisplay: HTMLElement = document.getElementById("game-options");
	const btnSubmit: HTMLButtonElement = document.getElementById('btn-submit') as HTMLButtonElement;
	const slctMode: HTMLSelectElement = document.getElementById('mode') as HTMLSelectElement;
	const slctLevel: HTMLSelectElement = document.getElementById('level') as HTMLSelectElement;

	if (!btnSubmit || !slctMode || !slctLevel || !optionsDisplay) {
		console.error("'options' UI not found, can't load game");
		return null;
	}

	//	Store selected options when user click on submit button
	return new Promise((resolve) => {
		btnSubmit.addEventListener('click', (e) => {
			e.preventDefault();
			let nbPlayer: number = parseInt(slctMode.value);
			let level: Level = parseInt(slctLevel.value) as Level;
			const options: IOptions = { 
				level: level, 
				nbOfPlayer: nbPlayer
			};
			optionsDisplay.remove();
			resolve(options);
		});
	});
}

export function displayGameWindow() : void {
	//	Select between 2 games --> TO DO
	//	Launch selected game with custom options
	selectGameOptions().then(options => {
		launchPongGame(options);
	});
}

