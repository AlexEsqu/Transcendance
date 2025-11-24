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
let name = localStorage.getItem("PongAlias");

if (name)
{
	displayGreeting(name);
}
else
{
	displayAliasQuery();
}

function displayGreeting(name)
{
	aliasPage.innerHTML = `
	<h1>Welcome, ${name}!</h1>
	<div id="alias-container">
		<label>To delete your alias, click here: </label>
		<button id="delete-btn">DELETE</button>
	</div>
	`
	const deleteButton = document.getElementById("delete-btn");
	deleteButton.addEventListener("click", function ()
	{
		console.log("clicking delete button");
		localStorage.removeItem("PongAlias");
		displayAliasQuery();
	})
}

function displayAliasQuery() {
	aliasPage.innerHTML = `
	<h1>Who Are You ?</h1>
	<div id="alias-container">
		<label>To access the game, please input an alias: </label>
		<input id="alias-input"></input>
		<button id="alias-btn">INPUT</button>
	</div>
	`
	const aliasButton = document.getElementById("alias-btn");
	aliasButton.addEventListener("click", function ()
	{
		console.log("clicking submit alias button");
		const aliasInput = document.getElementById("alias-input") as HTMLInputElement;
		const name = aliasInput.value;
		aliasInput.value = "";
		console.log(name);
		if (name)
		{
			localStorage.setItem("PongAlias", name);
			displayGreeting(name);
		}
	})
}
