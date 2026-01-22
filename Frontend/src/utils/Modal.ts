import { isValidInputs, checkInputValidityOnUnfocus } from "./inputValidation";

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
		console.log("showing modal")
		document.body.appendChild(this.modalElem);
	}

	close(): void
	{
		console.log("closing modal");
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
			checkInputValidityOnUnfocus(this.formElement);
			this.formElement.addEventListener('submit', async (e) => {
				e.preventDefault();
				if (this.formElement
					&& isValidInputs(this.formElement.querySelectorAll('input')))
				{
					const formData = new FormData(this.formElement!);
					await this.onConfirm(formData);
				}
			});
		}

		const cancelBtn = this.modalElem.querySelector('.modal-cancel') as HTMLButtonElement;
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.onCancel();
				this.close();
			});
		}
	}

	show(): void
	{
		super.show();
		this.formElement?.focus();
	}

	getFormData(): FormData
	{
		if (!this.formElement)
			throw new Error('No form received to create the Form Modal')
		return new FormData(this.formElement);
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
	}
}

export class InfoModal extends Modal
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
	}
}

import checkEmailHtml from "../html/info/checkEmailModal.html?raw";
import { userState } from "../app";

export class EmailCheckModal extends Modal
{
	email: string;

	constructor(email: string)
	{
		super(checkEmailHtml.replace('{{ EMAIL ADDRESS }}', email));
		this.email = email;
		this.setupModal();
	}

	setupModal(): void
	{
		const resendBtn = this.modalElem.querySelector('#resend-email-btn') as HTMLButtonElement;
		resendBtn.addEventListener('click', async () => {
			try {
				await userState.emailAuth.resendVerifEmail(this.email);
				resendBtn.textContent = 'Email Sent! Please wait 30 seconds';
				resendBtn.disabled = true;
				setTimeout(() => {
					resendBtn.textContent = 'Send Email Again';
					resendBtn.disabled = false;
				}, 30000);
			}
			catch (error) {
				if (error instanceof Error) {
					console.error('Resend email failed:', error);
					resendBtn.textContent = 'Failed to send';
				}
			}
		});

		const closeBtn = this.modalElem.querySelector('#back-btn') as HTMLButtonElement;
		closeBtn.addEventListener('click', () => {
			this.close();
		});
	}
}
