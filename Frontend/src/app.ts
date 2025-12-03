
import { displayAliasQueryPage } from "./landing/alias"
import { displayHeader, displayFooter } from "./landing/nav";
import { displayGameWindow } from "./landing/game";
import "./input.css";

export { displayGamePage }

// checking if the user has an alias, not diplaying the game until they do
let alias : string | null = localStorage.getItem("PongAlias");

function displayGamePage() : void
{
	document.body.innerHTML = "";
	let alias : string | null = localStorage.getItem("PongAlias");
	displayHeader(alias);
	displayGameWindow();
	displayFooter();
}

if (alias)
	displayGamePage();
else
	displayAliasQueryPage();


