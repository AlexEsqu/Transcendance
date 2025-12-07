import { Pong } from "../game/Pong"

import gameHtml from '../pages/game.html'
import menuHtml from '../pages/menu.html'

export { displayGameWindow }

class App {
	constructor(canvas : HTMLElement) {
		document.body.insertAdjacentHTML("beforeend", gameHtml);

		const pong = new Pong("game-canvas", undefined, undefined, true);
		requestAnimationFrame(() => {
			pong.loadGame();
			pong.startPlay();
		});
	}
}

function displayGameWindow() : void {
	document.body.insertAdjacentHTML("beforeend", menuHtml);

	const startButton : HTMLElement = document.getElementById('btn-startplay');
	if (!startButton) {
		console.log("ERROR: btn-startplay is null");
		return ;
	}

	startButton.addEventListener('click', (e) => {
		const menu = document.getElementById("game-menu");
		if (!menu) {
			console.log("ERROR: menu can't be removed");
			return ;
		}
		menu.remove();
		const gameWindow = document.getElementById("game-canvas");
		new App(gameWindow);
	});
}
