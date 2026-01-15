export { isValidInputs, checkInputValidityOnUnfocus}

function getInputErrorMsg(field: HTMLInputElement): string
{
	const validity = field.validity;

	if (validity.valueMissing)
		return 'This field is required.';

	if (validity.tooShort)
		return `Must be at least ${field.minLength} characters.`;

	if (validity.tooLong)
		return `Must be no more than ${field.maxLength} characters.`;

	if (field.dataset.errorMsg)
		return field.dataset.errorMsg;

	return 'This field is invalid.';
}

function validateInputField(field: HTMLInputElement): boolean
{
	const errorEl = field.parentElement?.querySelector('.error-hint') as HTMLElement | null;

	if (field.classList.contains('confirmation-input'))
	{
		const mustMatchInput = document.querySelector(`#${field.dataset.confirmationTarget}`) as HTMLInputElement;
		if (mustMatchInput && !validateMatchingFields(mustMatchInput, field))
			return false;
	}
	if (!field.validity.valid)
	{
		const errorMessage = getInputErrorMsg(field);

		if (errorEl)
		{
			errorEl.textContent = errorMessage;
			errorEl.style.display = 'block';
		}

		field.classList.add('invalid');
		return false;
	}
	else
	{
		if (errorEl)
		{
			errorEl.textContent = '';
			errorEl.style.display = 'none';
		}

		field.classList.remove('invalid');
		return true;
	}
}

function validateMatchingFields(original : HTMLInputElement, confirmation : HTMLInputElement)
{
	const errorEl = confirmation.parentElement?.querySelector('.error-hint') as HTMLElement | null;

	if (original.value !== confirmation.value)
	{
		if (errorEl)
		{
			errorEl.textContent = confirmation.dataset.errorMsg || 'Fields must match';
			errorEl.style.display = 'block';
		}
		confirmation.classList.add('invalid');
		return false;
	}

	if (errorEl)
	{
		errorEl.textContent = '';
		errorEl.style.display = 'none';
	}
	confirmation.classList.remove('invalid');
	return true;
}

function isValidInputs(fields : NodeListOf<HTMLInputElement>): boolean
{
	fields.forEach( field =>
		{
			if (!validateInputField(field))
				return false;
		}
	)

	return true;
}

function checkInputValidityOnUnfocus(form : HTMLFormElement)
{
	const fields = form.querySelectorAll('input');
	fields.forEach((input) =>
		{
			input.addEventListener("blur", () => {
				validateInputField(input);
			})
		}
	)
}
