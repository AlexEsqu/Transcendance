import { userState, router } from "../app";
import { getNavBarHtml, initNavBarListeners } from "../routing/nav";
import { launchPongGame } from "./GameApp"
import { clearOptions, loadOptions, saveOptions } from "./options";
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
	const paddleColorsInputs = document.getElementById('paddle-colors-container');
	if (!paddleColorsInputs)
		throw new Error("'paddle-colors-container' not found");

	paddleColorsInputs.innerHTML = '';

	for (let i = 1; i <= nbOfPlayers; i++)
	{
		const container = document.createElement('div');
		container.className = 'flex items-center justify-center gap-2';

		const label = document.createElement('label');
		label.htmlFor = `paddle-color-${i}`;
		label.className = 'p-1';
		label.textContent = nbOfPlayers === 1 ? 'Your color' : `Player ${i}`;

		const input = document.createElement('input');
		input.type = 'color';
		input.id = `paddle-color-${i}`;
		input.name = `paddle-color-${i}`;
		input.className = "w-12 h-6 border bg-transparent cursor-pointer p-0";
		input.value = '#a2c2e8';
		input.title = 'Choose paddle color';

		container.appendChild(label);
		container.appendChild(input);
		paddleColorsInputs.appendChild(container);
	}
}

function initializePlayerInputs(): void
{
	const gameTypeSelect = document.getElementById('game-type') as HTMLSelectElement;
	if (!gameTypeSelect) {
		throw new Error("'game-type' select not found");
	}

	const nbOfPlayers: number = parseInt(gameTypeSelect.value);

	generatePlayersInputs(nbOfPlayers);
	generatePaddleColorsInputs(nbOfPlayers);

	gameTypeSelect.addEventListener('change', function() {
		const newNbOfPlayers: number = parseInt(gameTypeSelect.value);
		generatePlayersInputs(newNbOfPlayers);
		generatePaddleColorsInputs(newNbOfPlayers);
	});
}

function getPlayerNames(): string[]
{
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

function getPaddColors(): string[]
{
	const paddColorsContainer = document.getElementById('paddle-colors-container');
	if (!paddColorsContainer)
		throw new Error("No players found");

	userState.refreshUser();

	const inputs = paddColorsContainer.querySelectorAll('input[type="color"]');
	const result = Array.from(inputs).map(input => (input as HTMLInputElement).value || '#a2c2e8');
	
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
		const gameType = formData.get('game-type') as string | null;
		const level = formData.get('level') as string | null;
		const matchLoc = formData.get('match-location') as string | null;

		// extracting data but putting default just in case some is missing
		const options: IOptions = {
			matchType: matchLoc ? matchLoc : 'local',
			level: level ? parseInt(level) : 0,
			nbOfPlayers: gameType ? parseInt(gameType) : 1,
			paddColors: getPaddColors() || '#a2c2e8',
			players: getPlayerNames(),
			ballColor: '#a2c2e8',
			mapColor: "#01011a"
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
		launchPongGame(options);
		clearOptions();
	}
	else
		router.navigateTo('/game/error')
}
