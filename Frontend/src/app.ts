import { Pong } from "./game/Pong"

class App {
    constructor() {
		const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        document.body.appendChild(canvas);
		const pong = new Pong("gameCanvas", "Popol", "Gaya");
		pong.startGame();
    }
}
new App();
