import { userState } from "../app";
import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { displayGameWindow, selectGameOptions } from "./GameApp"

import gameHtml from '../pages/game.html?raw'
import optionsHtml from '../pages/options.html?raw'

export { getGameHtml, getGameOptionHtml, initGamePageListeners };

function getGameHtml(): string
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + gameHtml).replace('USERNAME', name);
}

function getGameOptionHtml(): string
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + optionsHtml).replace('USERNAME', name);
}

function initGamePageListeners(): void
{
	initNavBarListeners();

	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

		switch (path)
		{

			case '/game':
			{
				onOptionLoaded();
				return;
			}

			case '/game/ai':
			{
				onAIGameLoaded();
				return;
			}

			// case '/game/local':
			// {
			// 	onLocalGameLoaded();
			// 	return;
			// }

			// case '/game/tournament':
			// {
			// 	onTournamentGameLoaded();
			// 	return;
			// }

			case '/game/error':
			{
				return;
			}

			default:
			{
				return;
			}

		}
	});
}


function onOptionLoaded(): void
{
	selectGameOptions();
}

function onAIGameLoaded(): void
{
	displayGameWindow();
}
