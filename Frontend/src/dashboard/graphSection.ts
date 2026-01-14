import { userState } from "../app";

export { displayMatchHistory }
export type { MatchHistory }

interface MatchHistory {
	id: number;
	date: string;
	opponent: string;
	playerScore: number;
	opponentScore: number;
	result: 'win' | 'loss';
}

async function displayMatchHistory(): Promise<void>
{
	let matches: MatchHistory[] = [];

	try
	{
		matches = await userState.customize.fetchMatchHistory();
		if (matches.length < 1)
			throw new Error("No history yet...")
	}
	catch (err)
	{
		displayError(err instanceof Error ? err.message : "Failed to load match history");
		return;
	}

	displayStatistics(matches);
	displayHistoryGraph(matches);
}

function displayStatistics(matches: MatchHistory[])
{
	const winsEl = document.getElementById('wins-count');
	const lossesEl = document.getElementById('losses-count');
	const winrateEl = document.getElementById('winrate-count');

	const wins = matches.filter(m => m.result === 'win').length;
	const losses = matches.filter(m => m.result === 'loss').length;
	const winRate = matches.length > 0 ? ((wins / matches.length) * 100).toFixed(1) : '0';

	if (winsEl)
		winsEl.textContent = wins.toString();

	if (lossesEl)
		lossesEl.textContent = losses.toString();

	if (winrateEl)
		winrateEl.textContent = `${winRate}%`;
}

function displayError(message: string): void
{
	const graphCanvas = document.getElementById('dashboard-graph-canvas') as HTMLCanvasElement;
	const graphContainer = document.getElementById('dashboard-graph-container');
	const errorText = document.getElementById('match-history-error');

	if (graphCanvas)
		graphCanvas.style.display = 'hidden';

	if (!graphContainer || !errorText)
		return;

	errorText.textContent = message;
}

function displayHistoryGraph(matches: MatchHistory[])
{
	const canvas = document.getElementById('dashboard-graph-canvas') as HTMLCanvasElement;
	const errorDiv = document.getElementById('match-history-error');
	if (!canvas)
		return;

	drawLineChart(canvas, matches);

	canvas.style.display = 'block';
	if (errorDiv)
		errorDiv.style.display = 'hidden';
}

function drawLineChart(canvas: HTMLCanvasElement, matches: MatchHistory[]): void
{
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;

	const padding = 50;
	const width = canvas.width;
	const height = canvas.height;

	// reinitialize canvas
	ctx.fillRect(0, 0, width, height);


	// TO DO
}
