
import { Pong } from "../game/Pong"

import { createAttachElement } from "./utils";

export { displayGame }

class App {
	constructor(container : HTMLElement) {
		const canvas = document.createElement("canvas");
		canvas.id = "gameCanvas";
		canvas.width = 800;
		canvas.height = 600;
		container.appendChild(canvas);
		// const pong = new Pong("gameCanvas", "Popol", "Gaya");
		requestAnimationFrame(() => {
			const pong = new Pong("gameCanvas", undefined, undefined, true);
			pong.loadGame();
			pong.startPlay();
		});
	}
}

function displayGame() : void {
	const gameWindow = createAttachElement("main", document.body, "game", "game");
	new App(gameWindow);
}
