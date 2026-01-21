import { Modal } from "../utils/Modal";
import optionsHtml from '../html/forms/gameOptionsForm.html?raw';
import { userState } from "../app";
import { IOptions } from "./pongData";
import { launchPongGame } from "./GameApp";

export class GameOptionsModal extends Modal
{
	formElement: HTMLFormElement | null = null;
	nbOfPlayers: number = 1;
	matchLocation: string = "local";

	constructor() {
		super(optionsHtml);
		this.setupModal();
	}

	setupModal(): void
	{
		this.formElement = this.modalElem.querySelector('form');
		if (!this.formElement)
			throw new Error('missing form element');

		const update = () => {
			const locationSelect = this.modalElem.querySelector('#match-location') as HTMLSelectElement;
			const playerContainer = this.modalElem.querySelector('#players-container') as HTMLElement;
			const paddleColorsContainer = this.modalElem.querySelector('#paddle-colors-container') as HTMLElement;

			this.matchLocation = locationSelect.value;
			const matchTypeSelect = this.modalElem.querySelector('#match-type') as HTMLSelectElement;
			this.nbOfPlayers = matchTypeSelect ? parseInt(matchTypeSelect.value) : 1;

			this.removeIncompatibleOptions()
			this.showPlayerUsernameInput(playerContainer);
			this.showPaddleCustom(paddleColorsContainer);
		};

		update();

		this.formElement.addEventListener('change', (e) => {
			update();
		});

		this.formElement.addEventListener('submit', (e) => {
			e.preventDefault();
			try {
				const options = this.extractOptions();
				launchPongGame(options);
				this.close();
			} catch (error) {
				console.error('Error during form submission:', error);
			}
		});
	}

	removeIncompatibleOptions()
	{
		if (this.matchLocation == "remote")
		{
			this.formElement?.querySelector("#match-type-ai")?.classList.add("hidden")
			const matchTypeSelect = this.formElement?.querySelector('#match-type') as HTMLSelectElement;
			if (matchTypeSelect && matchTypeSelect.value === "1") {
				matchTypeSelect.value = "2";
			}
		}
		else
		{
			this.formElement?.querySelector("#match-type-ai")?.classList.remove("hidden")
		}

	}

	extractOptions(): IOptions {
		const formData = new FormData(this.formElement!);

		const players: string[] = [];
		const colors: string[] = [];
		for (let i = 1; i <= this.nbOfPlayers; i++) {
			const name = formData.get(`player-${i}`) as string;
			const color = formData.get(`paddle-color-${i}`) as string;

			const defaultName = i === 1 ? (userState.getUser()?.getName() ?? 'Player 1') : `Player ${i}`;
			players.push(name || defaultName);
			colors.push(color || '#a2c2e8');
		}

		return {
			matchLocation: formData.get('match-location') as string,
			level: parseInt(formData.get('level') as string),
			nbOfPlayers: parseInt(formData.get('match-type') as string),
			players: players,
			paddColors: colors,
			ballColor: '#a2c2e8',
			mapColor: "#210446ff"
		};
	}

	showPlayerUsernameInput(playersContainer: HTMLElement): void
	{
		const inputs = playersContainer.querySelectorAll('input[name^="player-"]') as NodeListOf<HTMLInputElement>;
		inputs.forEach((input, idx) => {
			if (idx < this.nbOfPlayers)
			{
				input.classList.remove('invisible');
				if (idx === 0)
				{
					input.value = userState.getUser()?.getName() ?? '';
					input.readOnly = true;
				}
				else
				{
					input.readOnly = false;
				}
			}
			else
			{
				input.classList.add('invisible');
				input.value = '';
				input.readOnly = false;
			}
		});
	}


	showPaddleCustom(paddleColorsContainer: HTMLElement): void
	{
		const colorInputs = paddleColorsContainer.querySelectorAll('input[type="color"]');
		const labels = paddleColorsContainer.querySelectorAll('label');

		colorInputs.forEach((input, idx) => {
			if (idx < this.nbOfPlayers)
			{
				input.classList.remove('invisible');
				if (labels[idx]) labels[idx].classList.remove('invisible');
			}
			else
			{
				input.classList.add('invisible');
				if (labels[idx]) labels[idx].classList.add('invisible');
			}
		});
	}
}
