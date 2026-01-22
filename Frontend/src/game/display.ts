import { GameOptionsModal } from "./GameOptionModal";

import gameHtml from '../html/game.html?raw'

/************************************************************************************************************/

export { getGamePage, onGameLoaded, cleanGamePage, setNotification, displayGameHelpMessage };

/************************************************************************************************************/

function getGamePage(): string
{
	return gameHtml;
}

function setNotification(show: boolean, message: string | undefined): void
{
	const notification = document.getElementById('game-notification') as HTMLElement;
	if (!notification)
		return ;

	if (!show)
	{
		notification.classList.add('invisible');
		notification.classList.remove('flex');
		return ;
	}

	notification.textContent = message ?? '';
	notification.classList.remove('invisible');
	notification.classList.add('flex');
}

function displayGameHelpMessage(matchLocation: string): void
{
	const helpMsg = document.getElementById('game-help') as HTMLElement;
	if (!helpMsg)
		return ;

	if (matchLocation === 'local')
	{
		helpMsg.textContent = `Left Control : press W/S\n Right Control: press &#x2191;/U+02193`
	}


	helpMsg.classList.remove('invisible');
	helpMsg.classList.add('flex');

	//	Display only for 10 seconds
	setTimeout(() => {
		helpMsg.classList.remove('flex');
		helpMsg.classList.add('invisible');
	}, 10000);
}


function onGameLoaded(): void
{
	const existingModal = document.querySelector('.modal-overlay');
	if (existingModal)
		existingModal.remove();
	const modal = new GameOptionsModal();
	modal.show();
}

function cleanGamePage(): void
{
	const existingModal = document.querySelector('.modal-overlay');
	if (existingModal)
		existingModal.remove();
}
