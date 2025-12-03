import { IO } from "inspector/promises";
import { Pong } from "../game/Pong"
import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'
import menuHtml from '../pages/menu.html'

export enum Level {
	easy,
	medium,
	hard
};

export interface IOptions {
	level: Level;
	nbOfPlayer: number;
};

class App {
	constructor(canvas : HTMLElement, options: IOptions) {
		document.body.insertAdjacentHTML("beforeend", gameHtml);

		//	Hard coded users id -> must change later after user auth !!!!!!!
		const pong = new Pong("game-canvas", 1, 2, true);
		requestAnimationFrame(() => {
			pong.loadGame(options);
			pong.startPlay();
		});
	}
}

function launchPongGame(options: IOptions): void {
	//	Display game menu with start button
	document.body.insertAdjacentHTML("beforeend", menuHtml);
	const GuestInButton : HTMLElement = document.getElementById('btn-startplay');
	if (!GuestInButton) {
		console.error("'btn-startplay' is null");
		return ;
	}
	//	Launch Pong game when user click on start button
	GuestInButton.addEventListener('click', (e) => {
		const menu = document.getElementById("game-menu");
		if (!menu) {
			console.error("Element game-menu is null, can't load game");
			return ;
		}
		menu.remove();
		const gameWindow = document.getElementById("game-canvas");
		new App(gameWindow, options);
	});
}

function selectGameOptions(): IOptions {
	document.body.insertAdjacentHTML("beforeend", optionsHtml);
	const GuestInButton: HTMLElement = document.getElementById('btn')
	let level: Level;
	let soloPlayer: boolean;

	return null;
}

export function displayGameWindow() : void {
	//	Select between 2 games --> TO DO
	//	Select Pong game options
	const options: IOptions = selectGameOptions();
	if (options == null) {
		console.error("No game options selected, can't load game");
		return ;
	}
	//	Launch selected game with custom options
	launchPongGame(options);
}
