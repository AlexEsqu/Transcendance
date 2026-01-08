import { userState, router } from "../app";
import { getNavBarHtml, initNavBarListeners } from "../navigation/nav";
import { launchPongGame } from "./GameApp"
import { loadOptions, saveOptions } from "./options";
import { IOptions } from "./Data";

import gameHtml from '../pages/game.html?raw'
import optionsHtml from '../pages/options.html?raw'
import { loadGame } from "./Graphics";

export { getGameHtml, getGameOptionHtml, initGamePageListeners };

function getGameHtml(): string
{
	return gameHtml;
}

function getGameOptionHtml(): string
{
	return optionsHtml;
}

function initGamePageListeners(): void
{
	document.addEventListener('pageLoaded', (event: Event) => {
		const { detail: path } = event as CustomEvent<string>;

		switch (path)
		{

			case '/game/options':
			{
				onGameOptionLoaded();
				return;
			}

			case '/game':
			{
				const options = loadOptions()
				if (options)
					onGameLoaded();
				else
					router.navigateTo('/game/options')
				return;
			}

			case '/game/error':
			{
				// TO DO
				return;
			}

			default:
			{
				return;
			}

		}
	});
}

function generatePlayersInputs(nbOfPlayers: number): void
{
	const playersContainer = document.getElementById('players-container');
	if (!playersContainer) {
		throw new Error("'players-container' not found");
	}

	playersContainer.innerHTML = '';
	for (let i = 1; i <= nbOfPlayers; i++)
	{
		const input = document.createElement('input');
		input.type = 'text';
		input.id = `player${i}`;
		input.username = `player${i}`;
		input.placeholder = nbOfPlayers === 1 ? 'Your username' : `Player ${i}`;
		input.className = 'input-field p-2 placeholder:text-center';
		playersContainer.appendChild(input);
	}
}

function initializePlayerInputs(): void
{
	const modeSelect = document.getElementById('mode') as HTMLSelectElement;
	if (!modeSelect) {
		throw new Error("'mode' select not found");
	}

	generatePlayersInputs(parseInt(modeSelect.value));
	modeSelect.addEventListener('change', function() {
		const numberOfPlayers = parseInt(this.value);
		generatePlayersInputs(numberOfPlayers);
	});
}

function getPlayerNames(): string[] {
	const playersContainer = document.getElementById('players-container');
	if (!playersContainer)
		throw new Error("No players found");

	userState.refreshUser();

	const inputs = playersContainer.querySelectorAll('input');
	const result = Array.from(inputs).map(input => (input as HTMLInputElement).value || `Player ${input.id.replace('player', '')}`);
	if ( result[0] && result[0] === 'Player 1')
		result[0] = userState.getUser()?.getName() ?? 'Player 1';

	return result;
}

function onGameOptionLoaded(): void
{
	initializePlayerInputs();

	const optionsForm = document.getElementById("game-option-form") as HTMLFormElement | null;
	optionsForm?.addEventListener('submit', (event) =>
	{
		// prevent HTML form default actions such as add query strings to url, resetting...
		event.preventDefault();

		// dump all form results in a variable
		const formData = new FormData(optionsForm) as FormData;

		// idenitfy HTML element
		const modeSelect = formData.get('mode') as HTMLSelectElement | null;
		const levelSelect = formData.get('level') as HTMLSelectElement | null;
		const ballColor = formData.get('ball-level-input') as string | null;
		const backColor = formData.get('back-color-input') as string | null;
		const paddColor = formData.get('padd-color-input') as string | null;

		// extracting data but putting default just in case some is missing
		const options: IOptions = {
			level: levelSelect?.value ? parseInt(levelSelect.value) : 0,
			nbOfPlayers: modeSelect?.value ? parseInt(modeSelect.value) : 1,
			ballColor: ballColor || '#a2c2e8',
			mapColor: backColor || '#01011a',
			paddColor: paddColor || '#a2c2e8',
			players: getPlayerNames()
		}
		saveOptions(options);
		router.navigateTo('/game');
	})
}

function onGameLoaded(): void
{
	const options = loadOptions()
	if (options)
	{
		launchPongGame(options)
	}
	else
		router.navigateTo('/game/error')
}
