
import { displayGreetingHeader, displayAliasQueryPage, displayAliasDelete } from "./landing/alias"
import { displayGame } from "./landing/game";

export { displayGamePage }

// checking if the user has an alias, not diplaying the game until they do
let alias : string = localStorage.getItem("PongAlias");

function displayGamePage() : void
{
	document.body.innerHTML = "";
	let alias : string | null = localStorage.getItem("PongAlias");
	displayGreetingHeader(alias);
	displayGame();
	displayAliasDelete();
}

if (alias)
	displayGamePage();
else
	displayAliasQueryPage();


