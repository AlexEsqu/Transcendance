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
	GameApp.close
}
