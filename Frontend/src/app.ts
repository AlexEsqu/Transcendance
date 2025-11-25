import { Pong } from "./game/Pong"

class App {
    constructor() {
		const canvas = document.createElement("canvas");
        canvas.id = "gameCanvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        document.body.appendChild(canvas);
		const pong = new Pong("gameCanvas", "user1", "user2");
		pong.startGame();
    }
}
new App();
