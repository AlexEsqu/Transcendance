
import { Pong } from "../game/Pong"

import { createAttachElement } from "./utils";

export { displayGame }

class App {
	constructor(container : HTMLElement) {
		const canvas = document.createElement("canvas");
		canvas.id = "gameCanvas";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		container.appendChild(canvas);
		const pong = new Pong("gameCanvas");
		pong.startGame();
	}
}

function displayGame() : void {
	const gameWindow = createAttachElement("main", document.body, "game", "game");
	new App(gameWindow);
}
