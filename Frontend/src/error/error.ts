import errorHtml from '../pages/info/error.html?raw'

export { getErrorPage }

function getErrorPage(): string
{
	const errorMessage = window.sessionStorage.getItem("errorMessage") ?? "Unknown error";
	console.log(errorMessage);
	return (errorHtml.replace("UNKNOWN ERROR", errorMessage));
}
