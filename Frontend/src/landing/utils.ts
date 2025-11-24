export {createAttachElement};

function createAttachElement(type: string, container : HTMLElement, id : string, className : string)
{
	let element = document.createElement(type);

	if (id)
		element.setAttribute("id", `${id}-${type}`);
	if (className)
		element.setAttribute("className", className);

	container.appendChild(element);

	return element;
}
