export class Modal
{
	modalElem: HTMLElement;
	inputElement: HTMLInputElement | null = null;
	htmlContent: string;
	onConfirm: (value: string) => void | Promise<void>;
	onCancel: () => void;

	constructor(htmlContent: string, onConfirm: (value: string) => void | Promise<void>, onCancel: () => void )
	{
		this.htmlContent = htmlContent;
		this.onConfirm = onConfirm;
		this.onCancel = onCancel;
		this.modalElem = this.createModal(this.htmlContent);
		this.setupModal(onConfirm, onCancel);
	}

	createModal(htmlContent: string): HTMLElement
	{
		const template = document.createElement('div');
		template.innerHTML = htmlContent.trim();
		return template.firstElementChild as HTMLElement;
	}

	setupModal(onConfirm: (value: string) => void | Promise<void>, onCancel: () => void ): void
	{
		this.inputElement = this.modalElem.querySelector('input') as HTMLInputElement | null;
		const cancelBtn = this.modalElem.querySelector('.modal-cancel') as HTMLButtonElement;
		const confirmBtn = this.modalElem.querySelector('.modal-confirm') as HTMLButtonElement;

		const form = this.modalElem.querySelector('form') as HTMLFormElement | null;
		if (form) {
			form.addEventListener('submit', (e) => {
				e.preventDefault();
			});
		}

		cancelBtn.addEventListener('click', () =>
			{
				onCancel();
				this.close();
			}
		);

		confirmBtn.addEventListener('click', async () =>
			{
				const value = this.inputElement?.value || '';
				if (onConfirm)
					await onConfirm(value);
				this.close();
			}
		);

		this.modalElem.addEventListener('click', (e) =>
			{
				if (e.target === this.modalElem)
					this.close();
			}
		);
	}

	show(): void
	{
		document.body.appendChild(this.modalElem);
		this.inputElement?.focus();
	}

	close(): void
	{
		this.modalElem.remove();
	}

	getValue(): string
	{
		return this.inputElement?.value || '';
	}
}
