import { Pong } from "./Pong"
import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'
import { getNavBarHtml } from "../routing/nav";

export enum Level {
	easy,
	medium,
	hard,
};

export interface IOptions {
	level: Level;
	nbOfPlayer: number;
	ballColor: string;
	paddColor: string;
	backgroundColor: string;
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

	const startBtnDisplay: HTMLElement | null = document.getElementById("game-start");
	const btnStart: HTMLElement | null = document.getElementById('btn-startplay');
	const gameWindow: HTMLElement | null = document.getElementById("game-canvas");

	if (!btnStart || !startBtnDisplay || !gameWindow) {
		console.error("'start' UI not found, can't load game");
		return ;
	}

	//	Launch Pong game when user click on start button
	const app = new App(gameWindow, options);
	btnStart.addEventListener('click', (e) => {
		startBtnDisplay.remove();
		app.play();
	});
}

function selectGameOptions(): Promise<IOptions | null> {
	document.body.insertAdjacentHTML("beforeend", optionsHtml);

	const optionsMenuDisplay: HTMLElement | null = document.getElementById("game-options");
	const btnSubmit: HTMLButtonElement | null = document.getElementById('btn-submit') as HTMLButtonElement;
	const slctMode: HTMLSelectElement | null = document.getElementById('mode') as HTMLSelectElement;
	const slctLevel: HTMLSelectElement | null = document.getElementById('level') as HTMLSelectElement;
	const ballColorInput = document.getElementById('ball-color-input') as HTMLInputElement;
	const backColorInput = document.getElementById('back-color-input') as HTMLInputElement;
	const paddColorInput = document.getElementById('padd-color-input') as HTMLInputElement;

	if (!btnSubmit || !slctMode || !slctLevel || !optionsMenuDisplay) {
		console.error("'options' UI not found, can't load game");
		return Promise.resolve(null);
	}

	//	Store selected options when user click on submit button
	return new Promise((resolve) => {
		btnSubmit.addEventListener('click', (e) => {
			e.preventDefault();
			const nbPlayer: number = parseInt(slctMode.value);
			const level: Level = parseInt(slctLevel.value) as Level;
			const ballColor: string = ballColorInput.value;
			const backColor: string = backColorInput.value;
			const paddColor: string = paddColorInput.value;
			const options: IOptions = {
				level: level,
				nbOfPlayer: nbPlayer,
				ballColor: ballColor,
				backgroundColor: backColor,
				paddColor: paddColor
			};
			optionsMenuDisplay.remove();
			resolve(options);
		});
	});
}

export function displayGameWindow() : void
{
	const main = document.querySelector('main') as HTMLElement;
	if (!main)
		return;

	main.innerHTML = '';

	//	Select between 2 games --> TO DO
	//	Launch selected game with custom options
	selectGameOptions().then(options => {
		if (options)
			launchPongGame(options);
	});
}


