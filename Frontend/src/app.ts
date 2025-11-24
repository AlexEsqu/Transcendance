import { Pong } from "./game/Pong"

const submitAliasButtonText = "Submit";
const submitAliasTitleText = "Who are you ?"
const submitAliasLabelText = "Submit a username to start playing."


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

function createAttachElement(type: string, container : HTMLElement, id : string, className : string)
{
	let element = document.createElement(type);

	if (id)
		element.setAttribute("id", `${id}-${type}`);
	if (className)
		element.setAttribute("className", className);

	container.appendChild(element);

	return element;
}


function displayAliasQuery() {
	aliasPage.innerHTML = "";
	const id = "alias-query";

	// creating a title
	let submitAliasTitle = createAttachElement("h1", aliasPage, id, null);
	submitAliasTitle.appendChild(document.createTextNode(submitAliasTitleText));

	// creating a label for the username input field
	let submitAliasLabel = createAttachElement("label", aliasPage, id, null);
	submitAliasLabel.appendChild(document.createTextNode(submitAliasLabelText));

	// creating an input field, as HTML input element for typescript to allow to read from it
	let submitAliasInput = createAttachElement("input", aliasPage, id, null) as HTMLInputElement;

	// creating a button
	let submitAliasButton = createAttachElement("button", aliasPage, id, null);
	submitAliasButton.appendChild(document.createTextNode(submitAliasButtonText));

	// attaching a callback function to the button being clicked
	submitAliasButton.addEventListener("click", function ()
	{
		console.log("clicking submit alias button");
		const name = submitAliasInput.value;
		submitAliasInput.value = "";
		console.log(name);
		if (name)
		{
			localStorage.setItem("PongAlias", name);
			displayGreeting(name);
		}
	})

}
