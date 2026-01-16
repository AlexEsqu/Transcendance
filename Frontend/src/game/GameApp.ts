import { Pong } from "../game/Pong"
import { IOptions } from "../game/pongData"
import gameHtml from '../html/game.html?raw'
import optionsHtml from '../html/options.html?raw'

import { clearOptions, loadOptions } from "./options"

/************************************************************************************************************/

class GameApp
{
	pong: Pong | null = null;

	constructor(options: IOptions) {
		try {
			this.pong = new Pong("game-canvas", options);
			this.pong.goToWaitingRoom();
		} catch (error) {
			console.error(error); // TO DO: better error handling
		}
	}
}

export function launchPongGame(options: IOptions): void
{
	const element = document.getElementById('player-ready-input') as HTMLElement;
	if (element)
		element.style.display = 'none';

	//	Launch Pong game when user click on start button
	const app = new GameApp(options);
}
