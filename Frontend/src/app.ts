import { Pong } from "./game/Pong"

import { displayGreeting, displayAliasQuery } from "./landing/alias"

import { displayGameWindow } from "./landing/gameWindow";

const aliasPage = document.getElementById("alias-div");
let alias = localStorage.getItem("PongAlias");


if (alias)
{
	displayGreeting(alias);
	displayGameWindow();
}
else
	displayAliasQuery();


