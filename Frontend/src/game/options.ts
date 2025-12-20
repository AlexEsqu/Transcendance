import { IOptions, Level } from "./Data";

export {saveOptions, loadOptions, clearOptions }

const gameOPtionStorageKey = 'gameOptions';

function saveOptions(opts: IOptions): void
{
	sessionStorage.setItem(gameOPtionStorageKey, JSON.stringify(opts));
}

function loadOptions(): IOptions | null
{
	const raw = sessionStorage.getItem(gameOPtionStorageKey);
	if (!raw)
		return null;
	else
		return JSON.parse(raw);
}

function clearOptions(): void
{
	sessionStorage.removeItem(gameOPtionStorageKey);
}










