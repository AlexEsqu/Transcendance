import { Modal } from "../utils/Modal";
import optionsHtml from '../html/forms/gameOptionsForm.html?raw';
import { userState } from "../app";
import { IOptions } from "./pongData";
import { launchPongGame } from "./GameApp";
import { RegisteredUser } from "../user/User";

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
			this.matchLocation = locationSelect.value;
			const matchTypeSelect = this.modalElem.querySelector('#match-type') as HTMLSelectElement;
			this.nbOfPlayers = matchTypeSelect ? parseInt(matchTypeSelect.value) : 1;

			this.removeIncompatibleOptions()
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
		const playerContainer = this.modalElem.querySelector('#players-container') as HTMLElement;
		const customizePaddleContainer = this.modalElem.querySelector('#customize-paddle-container') as HTMLElement;
		const paddleColorsContainer = this.modalElem.querySelector('#paddle-colors-container') as HTMLElement;
		const customizeNameContainer = this.modalElem.querySelector('#customize-name-container') as HTMLElement;

		const user = userState.getUser();
		if (!(user instanceof RegisteredUser))
		{
			this.formElement?.querySelector('#match-location-remote')?.classList.add('hidden');
		}
		else
		{
			this.formElement?.querySelector('#match-location-remote')?.classList.remove('hidden');
		}

		if (this.matchLocation == "remote")
		{
			this.formElement?.querySelector("#match-type-ai")?.classList.add("hidden")
			this.formElement?.querySelector("#match-type-tournament")?.classList.add("hidden")
			const matchTypeSelect = this.formElement?.querySelector('#match-type') as HTMLSelectElement;
			if (matchTypeSelect && matchTypeSelect.value === "1")
			{
				matchTypeSelect.value = "2";
			}
			this.hideCustomOptions(customizeNameContainer, customizePaddleContainer);
		}
		else
		{
			this.formElement?.querySelector("#match-type-ai")?.classList.remove("hidden")
			this.formElement?.querySelector("#match-type-tournament")?.classList.remove("hidden")
			this.showPlayerUsernameInput(customizeNameContainer, playerContainer);
			this.showPaddleCustom(customizePaddleContainer, paddleColorsContainer);
		}

	}

	extractOptions(): IOptions {
		const formData = new FormData(this.formElement!);

		const matchLocation = formData.get('match-location') as string;
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
			matchLocation: matchLocation,
			level: parseInt(formData.get('level') as string),
			nbOfPlayers: parseInt(formData.get('match-type') as string),
			players: matchLocation == 'remote' ? [players[0]] : players,
			paddColors: colors,
			ballColor: '#a2c2e8',
			mapColor: "#210446ff"
		};
	}

	showPlayerUsernameInput(customizeNameContainer: HTMLElement,playersContainer: HTMLElement): void
	{
		customizeNameContainer.classList.remove('hidden');

		const inputs = playersContainer.querySelectorAll('input[name^="player-"]') as NodeListOf<HTMLInputElement>;
		inputs.forEach((input, idx) => {
			if (idx < this.nbOfPlayers)
			{
				input.classList.remove('hidden');
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
				input.classList.add('hidden');
				input.value = '';
				input.readOnly = false;
			}
		});
	}

	showPaddleCustom(customizePaddleContainer: HTMLElement, paddleColorsContainer: HTMLElement): void
	{
		customizePaddleContainer.classList.remove('hidden');

		const colorInputs = paddleColorsContainer.querySelectorAll('input[type="color"]');
		const labels = paddleColorsContainer.querySelectorAll('label');

		colorInputs.forEach((input, idx) => {
			if (idx < this.nbOfPlayers)
			{
				input.classList.remove('hidden');
				if (labels[idx]) labels[idx].classList.remove('hidden');
			}
			else
			{
				input.classList.add('hidden');
				if (labels[idx]) labels[idx].classList.add('hidden');
			}
		});
	}

	hideCustomOptions(customizeNameContainer: HTMLElement, customizePaddleContainer: HTMLElement)
	{
		customizeNameContainer.classList.add('hidden');
		customizeNameContainer.classList.remove('flex');
		customizePaddleContainer.classList.add('hidden');
	}
}
