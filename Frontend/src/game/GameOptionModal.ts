import { Modal } from "../utils/Modal";
import optionsHtml from '../html/forms/gameOptionsForm.html?raw';
import { userState } from "../app";
import { IOptions } from "./pongData";
import { launchPongGame } from "./GameApp";

export class GameOptionsModal extends Modal
{
	form: HTMLFormElement;
	isSubmitting: boolean = false;

	constructor()
	{
		super(optionsHtml);

		const form = this.modalElem.querySelector('form');
		if (!form)
			throw new Error('Game Options Form not found');
		this.form = form;

		this.setupModal();
		this.updateUI();
	}

	setupModal(): void
	{
		this.form.addEventListener('change', () => this.updateUI());

		this.form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (this.isSubmitting)
				return;

			try
			{
				this.isSubmitting = true;
				const options = this.extractOptions();
				launchPongGame(options);
				this.close();
			}
			catch (error)
			{
				console.error('Submission error:', error);
				this.isSubmitting = false;
			}
		});
	}

	updateUI(): void
	{
		const formData = new FormData(this.form);
		const location = formData.get('match-location') as string;
		const aiOption = this.form.querySelector('#match-type-ai') as HTMLElement;
		const typeSelect = this.form.querySelector('#match-type') as HTMLSelectElement;

		if (location === 'remote')
		{
			aiOption.classList.add('hidden');
			if (typeSelect.value === '1')
				typeSelect.value = '2';
		}
		else
			aiOption.classList.remove('hidden');

		const nbPlayers = parseInt(typeSelect.value) || 1;
		this.syncVisibility('#players-container input', nbPlayers, (el, i) =>
			{
				const input = el as HTMLInputElement;
				if (i === 0) {
					input.value = userState.getUser()?.getName() ?? '';
					input.readOnly = true;
				} else {
					input.readOnly = false;
				}
			}
		);

		this.syncVisibility('#paddle-colors-container > div', nbPlayers);
	}

	syncVisibility(selector: string, count: number, onShow?: (el: Element, index: number) => void)
	{
		const elements = this.form.querySelectorAll(selector);
		elements.forEach((el, index) =>
			{
				const isVisible = index < count;
				if (isVisible)
				{
					el.classList.remove('invisible');
					if (onShow) onShow(el, index);
				}
				else
				{
					el.classList.add('invisible');
					if (el instanceof HTMLInputElement) el.value = '';
				}
			}
		);
	}

	extractOptions(): IOptions
	{
		const formData = new FormData(this.form);
		const nbOfPlayers = parseInt(formData.get('match-type') as string);

		const players = Array.from({ length: nbOfPlayers }, (_, i) =>
			{
				const val = formData.get(`player-name-${i + 1}`) as string;
				if (i === 0) return userState.getUser()?.getName() ?? 'Player 1';
				return val || `Player ${i + 1}`;
			}
		);

		const colors = Array.from({ length: nbOfPlayers }, (_, i) =>
			{
				return (formData.get(`paddle-color-${i + 1}`) as string)
					|| '#a2c2e8';
			}
		);

		return {
			matchLocation: formData.get('match-location') as string,
			level: parseInt(formData.get('level') as string),
			nbOfPlayers,
			players,
			paddColors: colors,
			ballColor: '#a2c2e8',
			mapColor: "#210446ff"
		};
	}
}
