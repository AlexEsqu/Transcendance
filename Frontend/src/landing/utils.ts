export {createAttachElement, injectHTMLPage};

function createAttachElement(type: string, container : HTMLElement, id : string, className : string) : HTMLElement
{
	let element : HTMLElement = document.createElement(type);

	if (id)
		element.setAttribute("id", `${id}-${type}`);
	if (className)
		element.setAttribute("className", className);

	container.appendChild(element);

	return element;
}

async function injectHTMLPage(url: string, destination: HTMLElement): Promise<void>
{
	try
	{
		const response = await fetch(url);

		if (!response.ok)
		{
		throw new Error(`HTTP error! status: ${response.status}`);
		}

		const html = await response.text();
		destination.innerHTML = html;
	}
	catch (error)
	{
		console.error('Failed to load page:', url, error);
		destination.innerHTML = '<p>Failed to load content</p>';
	}
}
