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
