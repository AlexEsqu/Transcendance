import { GameOptionsModal } from "./GameOptionModal";

import gameHtml from '../html/game.html?raw'

/************************************************************************************************************/

export { getGamePage, onGameLoaded, cleanGamePage, setNotification };

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
		notification.classList.remove('absolute');
		// notification.style.display = 'invisible';
		return ;
	}

	notification.textContent = message ?? '';
	notification.classList.remove('invisible');
	notification.classList.add('absolute');
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
