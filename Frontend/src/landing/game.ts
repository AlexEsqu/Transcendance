
import { Pong } from "../game/Pong"

import { createAttachElement } from "./utils";

export { displayGame }

class App {
	constructor(container : HTMLElement) {
		const canvas = document.createElement("canvas");
		canvas.id = "gameCanvas";
		canvas.style.width = "800px";
		canvas.style.height = "600px";
		container.appendChild(canvas);
		const pong = new Pong("gameCanvas", "Popol", "Gaya");
		pong.startGame();
	}
}

function displayGame() : void {
	const gameWindow = createAttachElement("main", document.body, "game", "game");
	new App(gameWindow);
}
