import { userState, router } from "../app";
import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { launchPongGame } from "./GameApp"
import { loadOptions, saveOptions } from "./options";
import { IOptions } from "./Data";

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

			// case '/game/tournament':
			// {
			// 	onTournamentGameLoaded();
			// 	return;
			// }

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
	if (!playersContainer)
		throw new Error("'players-container' not found");

	playersContainer.innerHTML = '';

	for (let i = 1; i <= nbOfPlayers; i++)
	{
		const input = document.createElement('input');
		input.type = 'text';
		input.id = `player${i}`;
		input.name = `player${i}`;
		input.placeholder = nbOfPlayers === 1 ? 'Your name' : `Player ${i}`;
		input.className = 'input-field p-2 placeholder:text-center';
		playersContainer.appendChild(input);
	}
}

function generatePaddleColorsInputs(nbOfPlayers: number): void
{
	const paddleColorsInputs = document.getElementById('paddle-colors-inputs');
	if (!paddleColorsInputs)
		throw new Error("'paddle-colors-inputs' not found");

	paddleColorsInputs.innerHTML = '';

	for (let i = 1; i <= nbOfPlayers; i++)
	{
		// const input = document.createElement('div');
		// input.className = 'flex items-center justify-center gap-2';

		const label = document.createElement('label');
		label.htmlFor = 'paddle-color-${i}';
		label.className = 'p-1';
		label.textContent = 'Player ${i}';

		const input = document.createElement('div');
		input.id = 'paddle-color-${i}';
		input.name = 'paddle-color-${i}';
		input.className = 'flex items-center justify-center gap-2';

	}
}

function initializePlayerInputs(): void
{
	const modeSelect = document.getElementById('mode') as HTMLSelectElement;
	if (!modeSelect) {
		throw new Error("'mode' select not found");
	}

	const nbOfPlayers: number = parseInt(modeSelect.value);

	generatePlayersInputs(nbOfPlayers);
	generatePaddleColorsInputs(nbOfPlayers);

	modeSelect.addEventListener('change', function() {
		generatePlayersInputs(nbOfPlayers);
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

		// identify form values
		const mode = formData.get('mode') as string | null;
		const level = formData.get('level') as string | null;
		const ballColor = formData.get('ball-level-input') as string | null;
		const backColor = formData.get('back-color-input') as string | null;
		const paddColor = formData.get('padd-color-input') as string | null;

		// extracting data but putting default just in case some is missing
		const options: IOptions = {
			level: level ? parseInt(level) : 0,
			nbOfPlayers: mode ? parseInt(mode) : 1,
			ballColor: ballColor || '#a2c2e8',
			mapColor: backColor || '#01011a',
			paddColor: paddColor || '#a2c2e8',
			players: getPlayerNames()
		}
		saveOptions(options);
		console.log("CVSJDHFLKJSDHFLKSJDHLKJFHSDKFJ");
		console.log("load option: " + level);
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
