import { Pong } from "../game/Pong"
import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'

export enum Level {
	easy, medium, hard
};

export interface IOptions {
	level: Level;
	nbOfPlayer: number;
	ballColor: string;
	paddColor: string;
	mapColor: string;
};

class App {
	pong: Pong;
	constructor(canvas : HTMLElement, options: IOptions) {
		//	Hard coded users id -> must change later after user auth !!!!!!!
		this.pong = new Pong("game-canvas", 1, 2, options);
		this.pong.loadGame();
		this.pong.runGame();
	}

	play() {
		requestAnimationFrame(() => {
			this.pong.launch(3);
		});
	}
}

function launchPongGame(options: IOptions): void {
	//	Display start button and game window
	document.body.insertAdjacentHTML("beforeend", gameHtml);

	const startBtnDisplay: HTMLElement = document.getElementById("game-start");
	const btnStart: HTMLElement = document.getElementById('btn-startplay');
	
	if (!btnStart || !startBtnDisplay) {
		console.error("'start' UI not found, can't load game");
		return ;
	}

	//	Launch Pong game when user click on start button
	const gameWindow = document.getElementById("game-canvas");
	const app = new App(gameWindow, options);
	btnStart.addEventListener('click', (e) => {
		startBtnDisplay.remove();
		app.play();
	});
}

function selectGameOptions(): Promise<IOptions> {
	document.body.insertAdjacentHTML("beforeend", optionsHtml);

	const optionsMenuDisplay: HTMLElement = document.getElementById("game-options");
	const btnSubmit: HTMLButtonElement = document.getElementById('btn-submit') as HTMLButtonElement;
	const slctMode: HTMLSelectElement = document.getElementById('mode') as HTMLSelectElement;
	const slctLevel: HTMLSelectElement = document.getElementById('level') as HTMLSelectElement;
	const ballColorInput = document.getElementById('ball-color-input') as HTMLInputElement;
	const backColorInput = document.getElementById('back-color-input') as HTMLInputElement;
	const paddColorInput = document.getElementById('padd-color-input') as HTMLInputElement;

	if (!btnSubmit || !slctMode || !slctLevel || !optionsMenuDisplay) {
		console.error("'options' UI not found, can't load game");
		return null;
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
				mapColor: backColor,
				paddColor: paddColor
			};
			optionsMenuDisplay.remove();
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

