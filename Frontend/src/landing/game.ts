import { Pong } from "../game/Pong"

import gameHtml from '../pages/game.html'
import menuHtml from '../pages/menu.html'
import { displayFooter, displayHeader } from "./nav";

export { displayGameWindow }

class App {
	constructor(canvas : HTMLElement) {
		document.body.insertAdjacentHTML("beforeend", gameHtml);

		const date = new Date(Date.now());
		console.log(date.toISOString());
		//	Hard coded users id -> must change later after auth
		const pong = new Pong("game-canvas", 1, 2, true);
		requestAnimationFrame(() => {
			pong.loadGame();
			pong.startPlay();
		});
	}
}

function displayGameWindow() : void {
	document.body.insertAdjacentHTML("beforeend", menuHtml);

	const GuestInButton : HTMLElement = document.getElementById('btn-startplay');
	if (!GuestInButton) {
		console.log("ERROR: btn-startplay is null");
		return ;
	}

	GuestInButton.addEventListener('click', (e) => {
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
