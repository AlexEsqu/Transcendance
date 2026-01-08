import friendTemplateHtml from "../html/templates/friend.html?raw";
import userTemplateHtml   from "../html/templates/user.html?raw";

export { friendTemplate, userTemplate };

const parser = new DOMParser();

function loadTemplate(html: string, id: string): HTMLTemplateElement
{
	const tpl = parser.parseFromString(html, "text/html").querySelector(id);
	if (!tpl)
		throw new Error(`Template ${id} not found`);
	return tpl as HTMLTemplateElement;
}

const friendTemplate = loadTemplate(friendTemplateHtml, "#friend-item-template");
const userTemplate   = loadTemplate(userTemplateHtml, "#user-item-template");


