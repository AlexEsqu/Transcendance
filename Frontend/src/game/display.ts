import { userState, router } from "../app";
import { launchPongGame } from "./GameApp"
import { clearOptions, loadOptions, saveOptions } from "./options";
import { IOptions } from "./pongData";
import { GameOptionsModal } from "./GameOptionModal";

import gameHtml from '../html/game.html?raw'
import optionsHtml from '../html/forms/gameOptionsForm.html?raw'

/************************************************************************************************************/

export { getGamePage, onGameLoaded, cleanGamePage, setNotification };

/************************************************************************************************************/

function getGamePage(): string
{
	return gameHtml;
}

// function generatePaddleColorsInputs(nbOfPlayers: number, root: HTMLElement): void
// {
// 	const paddleColorsInputs = document.getElementById('paddle-colors-container');
// 	if (!paddleColorsInputs)
// 		throw new Error("'paddle-colors-container' not found");

// 	paddleColorsInputs.innerHTML = '';

// 	for (let i = 1; i <= nbOfPlayers; i++)
// 	{
// 		const container = document.createElement('div');
// 		container.className = 'flex items-center justify-center gap-2';

// 		const label = document.createElement('label');
// 		label.htmlFor = `paddle-color-${i}`;
// 		label.className = 'p-1';
// 		label.textContent = nbOfPlayers === 1 ? (userState.getUser()?.getName() ?? 'Your color') : `Player ${i}`;

// 		const input = document.createElement('input');
// 		input.type = 'color';
// 		input.id = `paddle-color-${i}`;
// 		input.name = `paddle-color-${i}`;
// 		input.className = "w-12 h-10 border bg-transparent cursor-pointer";
// 		input.value = '#a2c2e8';
// 		input.title = 'Choose paddle color';

// 		container.appendChild(label);
// 		container.appendChild(input);
// 		paddleColorsInputs.appendChild(container);
// 	}
// }

// function generateMatchType(match: HTMLElement, location: HTMLSelectElement, root: HTMLElement)
// {
// 	match.innerHTML = '';

// 	const container = document.createElement('div');
// 	container.className = 'flex flex-col flex-center gap-1 m-1 text-center';

// 	const selection = document.createElement('select');
// 	selection.className = 'gentle-select';
// 	selection.title = 'Choose which type of match you want to play';

// 	if (location.value === 'local') {
// 		const robotOpponent = document.createElement('option');
// 		robotOpponent.value = '1';
// 		robotOpponent.textContent = 'One player and a robot';
// 		selection.appendChild(robotOpponent);
// 	}

// 	const twoPlayers = document.createElement('option');
// 	twoPlayers.value = '2';
// 	twoPlayers.textContent = 'Two players';

// 	const tournament = document.createElement('option');
// 	tournament.value = '4';
// 	tournament.textContent = 'Tournament with 4 players';

// 	selection.appendChild(twoPlayers);
// 	selection.appendChild(tournament);
// 	container.appendChild(selection);
// 	match.appendChild(container);
// }

// function initializeGameOptionsForm(root: HTMLElement): void
// {
// 	const macthTypeContainer = root.querySelector('match-type-container') as HTMLElement;
// 	const locationSelect = root.querySelector('match-location') as HTMLSelectElement;

// 	if (!macthTypeContainer)
// 		throw new Error("'match-type-container' select not found");
// 	else if (!locationSelect)
// 		throw new Error("'match-location' select not found");

// 	generateMatchType(macthTypeContainer, locationSelect, root);

// 	const matchSelect = macthTypeContainer.querySelector('select') as HTMLSelectElement;

// 	let nbOfPlayers: number = parseInt(matchSelect.value);
// 	if (locationSelect.value === 'remote')
// 		nbOfPlayers = 1;

// 	generatePlayersInputs(nbOfPlayers, root);
// 	generatePaddleColorsInputs(nbOfPlayers, root);

// 	macthTypeContainer.addEventListener('change', function() {
// 		const matchSelect = macthTypeContainer.querySelector('select') as HTMLSelectElement;

// 		let newNbOfPlayers: number = parseInt(matchSelect.value);
// 		if (locationSelect.value === 'remote')
// 			newNbOfPlayers = 1;

// 		generatePlayersInputs(newNbOfPlayers, root);
// 		generatePaddleColorsInputs(newNbOfPlayers, root);
// 	});

// 	locationSelect.addEventListener('change', function() {
// 		generateMatchType(macthTypeContainer, locationSelect, root);

// 		const matchSelect = macthTypeContainer.querySelector('select') as HTMLSelectElement;

// 		let newNbOfPlayers: number = parseInt(matchSelect.value);
// 		if (locationSelect.value === 'remote')
// 			newNbOfPlayers = 1;

// 		generatePlayersInputs(newNbOfPlayers, root);
// 		generatePaddleColorsInputs(newNbOfPlayers, root);
// 	});
// }

// function getPlayerNames(root: HTMLElement): string[]
// {
// 	const playersContainer = root.querySelector('players-container');
// 	if (!playersContainer)
// 		throw new Error("No players found");

// 	const inputs = playersContainer.querySelectorAll('input');
// 	const result = Array.from(inputs).map(input => (input as HTMLInputElement).value || `Player ${input.id.replace('player', '')}`);
// 	if ( result[0] && result[0] === 'Player 1')
// 		result[0] = userState.getUser()?.getName() ?? 'Player 1';

// 	return result;
// }

// function getPaddColors(root: HTMLElement): string[]
// {
// 	const paddColorsContainer = root.querySelector('paddle-colors-container');
// 	if (!paddColorsContainer)
// 		throw new Error("No players found");

// 	userState.refreshUser();

// 	const inputs = paddColorsContainer.querySelectorAll('input[type="color"]');
// 	const result = Array.from(inputs).map(input => (input as HTMLInputElement).value || '#a2c2e8');

// 	return result;
// }

// function getMatchType(root: HTMLElement): number
// {
// 	const matchContainer = root.querySelector('match-type-container');
// 	if (!matchContainer)
// 		throw new Error("No match type found");

// 	userState.refreshUser();

// 	const selection = matchContainer.querySelector('select');
// 	if (!selection)
// 		throw new Error("No selection found");

// 	const result = parseInt(selection.value);
// 	return (result);
// }

function setNotification(show: boolean, message: string | undefined): void
{
	const notification = document.getElementById('game-notification') as HTMLElement;
	if (!notification)
		return ;

	if (!show)
	{
		notification.classList.add('invisible');
		notification.classList.remove('flex');
		// notification.style.display = 'invisible';
		return ;
	}

	notification.textContent = message ?? '';
	notification.className = 'text-2xl text-center';
	notification.classList.remove('invisible');
	notification.classList.add('flex');
}

function onGameLoaded(): void
{
	const modal = new GameOptionsModal();
	modal.show();
}

function cleanGamePage(): void
{
	// TO BE FILLED
}
