import { Pong } from "../game/Pong"

import gameHtml from '../pages/game.html'

export { displayGame }

class App {
	constructor(canvas : HTMLElement) {
		// const pong = new Pong("gameCanvas", "Popol", "Gaya");
		requestAnimationFrame(() => {
			const pong = new Pong("game-canvas", undefined, undefined, true);
			pong.loadGame();
			pong.startPlay();
		});
	}
}

function displayGame() : void {

	document.body.innerHTML += gameHtml;

	const gameWindow = document.getElementById("game-canvas");
	new App(gameWindow);
}


