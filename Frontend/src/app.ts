import { Pong } from "./game/Pong"

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

const aliasPage = document.getElementById("alias-div");
const aliasInput = document.getElementById("alias-input") as HTMLInputElement;
const aliasButton = document.getElementById("alias-btn");

aliasButton.addEventListener("click", function () {
	const name = aliasInput.value;
	aliasInput.value = "";
	console.log(name);
	localStorage.setItem("PongAlias", name);
	displayName(name);
})

function displayName(name) {
	aliasPage.innerHTML = `
	<h1>Welcome, ${localStorage.getItem("PongAlias")}!<\h1>
	`
}
