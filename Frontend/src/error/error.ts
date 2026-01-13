import { ErrorModal } from "../utils/Modal";

export { getErrorPage, openErrorModal }

async function getErrorPage(): Promise<string>
{
	const errorMessage = window.sessionStorage.getItem("errorMessage") ?? "Unknown error";
	console.log(errorMessage);

	const response = await fetch('/src/html/info/error.html?raw');
	const errorHtml = await response.text();

	return errorHtml.replace("{{ERROR_MESSAGE}}", errorMessage);
}

async function openErrorModal(err: Error): Promise<void>
{
	try
	{
		const { default: errorModalHtml } = await import('../html/info/errorModal.html?raw');

		const errorTitle = err.name || "Error";
		const errorMessage = err.message || "An unknown error occurred";

		const finalHtml = errorModalHtml
			.replace("{{ERROR_TITLE}}", errorTitle)
			.replace("{{ERROR_MESSAGE}}", errorMessage);

		const modal = new ErrorModal(finalHtml);
		modal.show();
	}
	catch (error)
	{
		console.error('Failed to create/show modal:', error);
		throw error;
	}
}
