import { Pong } from "./game/Pong"

import { displayGreeting, displayAliasQuery } from "./landing/alias"

const aliasPage = document.getElementById("alias-div");
let alias = localStorage.getItem("PongAlias");

class App {
    constructor() {
		const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        document.body.appendChild(canvas);
		const pong = new Pong("gameCanvas");
		pong.startGame();
    }
}
// new App();


if (alias)
	displayGreeting(alias);
else
	displayAliasQuery();


