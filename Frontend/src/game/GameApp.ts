import { Pong } from "../game/Pong"
import { IOptions, Level } from "../game/Data"
import gameHtml from '../pages/game.html'
import optionsHtml from '../pages/options.html'

class App {
	pong: Pong;
	startBtnDisplay: HTMLElement | null;
	startBtn: HTMLElement | null;

	constructor(canvas : HTMLElement, options: IOptions) {
		this.startBtnDisplay = document.getElementById("game-start");
		this.startBtn = document.getElementById('btn-startplay');
		this.setupStartButton();

		this.pong = new Pong("game-canvas", options, () => this.showStartButton());
		this.pong.runGame();
	}

	play() {
		requestAnimationFrame(() => {
			this.pong.launch(3);
		});
	}

	setupStartButton() {
		if (!this.startBtn || !this.startBtnDisplay) {
			console.error("'start button' UI not found");
			return ;
		}

		this.startBtn.addEventListener('click', () => {
			if (this.startBtnDisplay) this.startBtnDisplay.style.display = 'none';
			this.play();
		});
	}

	showStartButton() {
		if (this.startBtnDisplay) this.startBtnDisplay.style.display = 'flex';
	}
}

function launchPongGame(options: IOptions): void
{
	//	Display start button and game window
	document.body.insertAdjacentHTML("beforeend", gameHtml);

	const startBtnDisplay: HTMLElement | null = document.getElementById("game-start");
	const btnStart: HTMLElement | null = document.getElementById('btn-startplay');

	if (!btnStart || !startBtnDisplay) {
		console.error("'start' UI not found, can't load game");
		return ;
	}

	//	Launch Pong game when user click on start button
	const gameWindow = document.getElementById("game-canvas") as HTMLCanvasElement;
	gameWindow.width = window.innerWidth;
	gameWindow.height = window.innerHeight;
	if (!gameWindow.getContext) {
		console.error("canvas context not found");
		return ;
	}
	const app = new App(gameWindow, options);
}

function generatePlayersInputs(nbOfPlayers: number): void
{
	const playersContainer = document.getElementById('players-container');
	if (!playersContainer) {
		console.error("'players-container' not found");
		return ;
	}

	playersContainer.innerHTML = '';
	for (let i = 1; i <= nbOfPlayers; i++)
	{
		const input = document.createElement('input');
		input.type = 'text';
		input.id = `player${i}`;
        input.name = `player${i}`;
        input.placeholder = nbOfPlayers === 1 ? 'Your name' : `Player ${i}`;
        input.className = 'w-full bg-transparent text-slate-700 text-sm border border-slate-200 rounded px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400';
        playersContainer.appendChild(input);
	}
}

function getPlayerNames(): string[] {
    const playersContainer = document.getElementById('players-container');
    if (!playersContainer) return [];

    const inputs = playersContainer.querySelectorAll('input');
    return Array.from(inputs).map(input => (input as HTMLInputElement).value || `Player ${input.id.replace('player', '')}`);
}

function initializePlayerInputs(): void {
    const modeSelect = document.getElementById('mode') as HTMLSelectElement;
    if (!modeSelect) {
        console.error("'mode' select not found");
        return;
    }

    generatePlayersInputs(parseInt(modeSelect.value));
    modeSelect.addEventListener('change', function() {
        const numberOfPlayers = parseInt(this.value);
        generatePlayersInputs(numberOfPlayers);
    });
}

function selectGameOptions(): Promise<IOptions>
{
	document.body.insertAdjacentHTML("beforeend", optionsHtml);
	initializePlayerInputs();

	const optionsMenuDisplay: HTMLElement | null = document.getElementById("game-options");
	const btnSubmit: HTMLButtonElement = document.getElementById('btn-submit') as HTMLButtonElement;
	const slctMode: HTMLSelectElement = document.getElementById('mode') as HTMLSelectElement;
	const slctLevel: HTMLSelectElement = document.getElementById('level') as HTMLSelectElement;
	const ballColorInput = document.getElementById('ball-color-input') as HTMLInputElement;
	const backColorInput = document.getElementById('back-color-input') as HTMLInputElement;
	const paddColorInput = document.getElementById('padd-color-input') as HTMLInputElement;

	if (!btnSubmit || !slctMode || !slctLevel || !optionsMenuDisplay) {
		console.error("'options' UI not found, can't load game");
		// return ;
	}

	//	Return selected options when user click on submit button
	return new Promise((resolve) => {
		btnSubmit.addEventListener('click', (e) => {
			e.preventDefault();
			const nbPlayer: number = parseInt(slctMode.value);
			const level: Level = parseInt(slctLevel.value) as Level;
			const ballColor: string = ballColorInput.value;
			const backColor: string = backColorInput.value;
			const paddColor: string = paddColorInput.value;
			const options: IOptions = {
				level: level,
				nbOfPlayers: nbPlayer,
				ballColor: ballColor,
				mapColor: backColor,
				paddColor: paddColor,
				players: getPlayerNames()
			};
			if (optionsMenuDisplay) optionsMenuDisplay.remove();
			resolve(options);
		});
	});
}


export function displayGameWindow(): void
{
	selectGameOptions().then(options => {
		launchPongGame(options);
	});
}
