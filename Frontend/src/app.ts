
import { displayGreeting, displayAliasQuery, displayAliasDelete } from "./landing/alias"
import { displayGameWindow } from "./landing/game";

// checking if the user has an alias, not diplaying the game until they do
let alias = localStorage.getItem("PongAlias");

if (alias)
{
	displayGreeting(alias);
	displayGameWindow();
	displayAliasDelete();
}
else
	displayAliasQuery();


