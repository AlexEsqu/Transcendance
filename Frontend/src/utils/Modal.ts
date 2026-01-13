export abstract class Modal
{
	modalElem: HTMLElement;
	htmlContent: string;

	constructor(htmlContent: string)
	{
		this.htmlContent = htmlContent;
		this.modalElem = this.createModalElem(this.htmlContent);
	}

	createModalElem(htmlContent: string): HTMLElement
	{
		const template = document.createElement('div');
		template.innerHTML = htmlContent.trim();
		return template.querySelector('.modal-overlay') as HTMLElement;
	}

	abstract setupModal(): void;

	show(): void
	{
		document.body.appendChild(this.modalElem);
	}

	close(): void
	{
		this.modalElem.remove();
	}
}

export class FormModal extends Modal
{
	formElement: HTMLFormElement | null = null;
	onConfirm: (formData: FormData) => void | Promise<void>;
	onCancel: () => void;

	/**
     * Creates an input modal with text entry field.
     * @param htmlContent - HTML template string with form, submit button with .modal-confirm class and cancel button .modal-cancel
     * @param onConfirm - Callback when user confirms, using the form data
     * @param onCancel - Callback when user cancels, by default a no-op (empty function doing nothing)
     */
	constructor(
		htmlContent: string,
		onConfirm: (formData: FormData) => void | Promise<void>,
		onCancel: () => void = () => {}
	)
	{
		super(htmlContent);
		this.onConfirm = onConfirm;
		this.onCancel = onCancel;
		this.setupModal();
	}

	setupModal(): void
	{
		this.formElement = this.modalElem.querySelector('form') as HTMLFormElement;
		if (this.formElement) {
			this.formElement.addEventListener('submit', async (e) => {
				e.preventDefault();
				const formData = new FormData(this.formElement!);
				await this.onConfirm(formData);
				this.close();
			});
		}

		const cancelBtn = this.modalElem.querySelector('.modal-cancel') as HTMLButtonElement;
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.onCancel();
				this.close();
			});
		}

		this.modalElem.addEventListener('click', (e) => {
			if (e.target === this.modalElem)
				this.close();
		});
	}

	show(): void
	{
		super.show();
		this.formElement?.focus();
	}

	getFormData(): FormData | null
	{
		return this.formElement ? new FormData(this.formElement) : null;
	}
}

export class ErrorModal extends Modal
{
	/**
	 * Creates an error/message modal.
	 * @param htmlContent - HTML template string with message and confirm button with .modal-confirm class
	 */
	constructor(htmlContent: string)
	{
		super(htmlContent);
		this.setupModal();
	}

	setupModal(): void
	{
		const confirmBtn = this.modalElem.querySelector('.modal-confirm') as HTMLButtonElement;
		confirmBtn.addEventListener('click', () => {
			this.close();
		});

		this.modalElem.addEventListener('click', (e) => {
			if (e.target === this.modalElem)
				this.close();
		});
	}
}
