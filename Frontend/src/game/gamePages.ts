import { userState } from "../app";
import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { displayGameWindow } from "./GameApp"

import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'

export { getGameHtml, initGamePageListeners };

function getGameHtml(): string
{
	const name = userState.getUser()?.getName() ?? "Guest";
	return (getNavBarHtml() + gameHtml).replace('USERNAME', name);
}

function initGamePageListeners(): void
{
	initNavBarListeners();

	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

		switch (path)
		{
			case '/game/ia':
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

			default:
			{
				onAIGameLoaded();
			}

		}
	});
}

function onAIGameLoaded(): void
{
	displayGameWindow();
}
