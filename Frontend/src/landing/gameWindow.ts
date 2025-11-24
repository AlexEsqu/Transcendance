
import { Pong } from "../game/Pong"

import { displayGreeting, displayAliasQuery } from "./alias"
import { createAttachElement } from "./utils";

export { displayGameWindow }

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

function displayGameWindow()
{
	if (!localStorage.getItem("PongAlias"))
		return;
	
	const gameWindow = createAttachElement("div", document.body, "game", "game");

	new App(gameWindow);
}
