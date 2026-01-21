import { Modal } from "../utils/Modal";
import optionsHtml from '../html/forms/gameOptionsForm.html?raw';
import { userState } from "../app";
import { IOptions } from "./pongData";
import { launchPongGame } from "./GameApp";

export class GameOptionsModal extends Modal
{
	formElement: HTMLFormElement | null = null;

	constructor() {
		super(optionsHtml);
		this.setupModal();
	}

	setupModal(): void {
		this.formElement = this.modalElem.querySelector('form');
			if (!this.formElement) throw new Error('missing form element');

			const typeContainer = this.modalElem.querySelector('#match-type-container') as HTMLElement;
			const playerContainer = this.modalElem.querySelector('#players-container') as HTMLElement;
			const paddleColorsContainer = this.modalElem.querySelector('#paddle-colors-container') as HTMLElement;

			const update = () => {
				const locationSelect = this.formElement!.querySelector('#match-location') as HTMLSelectElement;

				this.generateMatchType(typeContainer, locationSelect);
				const matchTypeSelect = typeContainer.querySelector('select[name="match-type"]') as HTMLSelectElement;
				const nb = matchTypeSelect ? parseInt(matchTypeSelect.value) : 1;
				const finalNb = locationSelect.value === 'remote' ? 1 : nb;

				this.generatePlayersInputs(finalNb, playerContainer);
				this.generatePaddleColorsInputs(finalNb, paddleColorsContainer);
			};

			update();

			this.formElement.addEventListener('change', (e) => {
				update();
			});

			this.formElement.addEventListener('submit', (e) => {
				e.preventDefault();
				launchPongGame(this.extractOptions());
				this.close();
			});
	}

	extractOptions(): IOptions {
		const formData = new FormData(this.formElement!);

		const location = formData.get('match-location') as string;
		const level = parseInt(formData.get('level') as string);
		const nbOfPlayers = parseInt(formData.get('match-type') as string);
		const players: string[] = [];
		const colors: string[] = [];

		for (let i = 1; i <= nbOfPlayers; i++) {
			const name = formData.get(`player-${i}`) as string;
			const color = formData.get(`paddle-color-${i}`) as string;

			const defaultName = i === 1 ? (userState.getUser()?.getName() ?? 'Player 1') : `Player ${i}`;
			players.push(name || defaultName);
			colors.push(color || '#a2c2e8');
		}

		return {
			matchLocation: location,
			level: level,
			nbOfPlayers: nbOfPlayers,
			players: players,
			paddColors: colors,
			ballColor: '#a2c2e8',
			mapColor: "#210446ff"
		};
	}

	generatePlayersInputs(nbOfPlayers: number, playersContainer: HTMLElement): void
	{
		playersContainer.innerHTML = '';

		for (let i = 1; i <= nbOfPlayers; i++)
		{
			const input = document.createElement('input');
			input.type = 'text';
			input.id = `player${i}`;
			if (nbOfPlayers === 1 || i === 1)
				input.placeholder = userState.getUser()?.getName() ?? 'Player 1';
			else
				input.placeholder = `Player ${i}`;
			input.className = 'input-field p-2 placeholder:text-center';
			input.name = `player-${i}`;
			if (i === 1)
			{
				input.value = userState.getUser()?.getName() ?? '';
				input.readOnly = true;
			}
			playersContainer.appendChild(input);
		}
	}

	generateMatchType(match: HTMLElement, location: HTMLSelectElement)
	{
		match.innerHTML = '';

		const container = document.createElement('div');
		container.className = 'flex flex-col flex-center gap-1 m-1 text-center';

		const selection = document.createElement('select');
		selection.className = 'gentle-select';
		selection.title = 'Choose which type of match you want to play';
		selection.name = 'match-type';

		if (location.value === 'local') {
			const robotOpponent = document.createElement('option');
			robotOpponent.value = '1';
			robotOpponent.textContent = 'One player and a robot';
			selection.appendChild(robotOpponent);
		}

		const twoPlayers = document.createElement('option');
		twoPlayers.value = '2';
		twoPlayers.textContent = 'Two players';

		const tournament = document.createElement('option');
		tournament.value = '4';
		tournament.textContent = 'Tournament with 4 players';

		selection.appendChild(twoPlayers);
		selection.appendChild(tournament);
		container.appendChild(selection);
		match.appendChild(container);
	}

	generatePaddleColorsInputs(nbOfPlayers: number, paddleColorsContainer: HTMLElement): void
	{
		paddleColorsContainer.innerHTML = '';

		for (let i = 1; i <= nbOfPlayers; i++)
		{
			const container = document.createElement('div');
			container.className = 'flex items-center justify-center gap-2';

			const label = document.createElement('label');
			label.htmlFor = `paddle-color-${i}`;
			label.className = 'p-1';
			label.textContent = nbOfPlayers === 1 ? (userState.getUser()?.getName() ?? 'Your color') : `Player ${i}`;

			const input = document.createElement('input');
			input.type = 'color';
			input.id = `paddle-color-${i}`;
			input.name = `paddle-color-${i}`;
			input.className = "w-12 h-10 border bg-transparent cursor-pointer";
			input.value = '#a2c2e8';
			input.title = 'Choose paddle color';

			container.appendChild(label);
			container.appendChild(input);
			paddleColorsContainer.appendChild(container);
		}
	}
}
