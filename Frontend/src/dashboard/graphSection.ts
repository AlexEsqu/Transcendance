import { userState } from "../app";
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // for time scale parsing

export { displayMatchHistory }
export type { MatchHistory, BackendMatch }


interface MatchHistory {
	id: number;
	date: string;
	opponent: string;
	playerScore: number;
	opponentScore: number;
	result: 'win' | 'loss';
}

interface BackendMatch {
	id: number;
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
}

Chart.register(
	...registerables
);

function transformMatchData(backendMatches: BackendMatch[], userId: number): MatchHistory[] {
	return backendMatches.map(match => {
		const isWinner = match.winner_id === userId;
		return {
			id: match.id,
			date: match.date,
			opponent: isWinner ? `User ${match.loser_id}` : `User ${match.winner_id}`,
			playerScore: isWinner ? match.winner_score : match.loser_score,
			opponentScore: isWinner ? match.loser_score : match.winner_score,
			result: isWinner ? 'win' : 'loss'
		};
	});
}

async function displayMatchHistory(): Promise<void>
{
	let matches: MatchHistory[] = [];

	try
	{
		const backendMatches = await userState.customize.fetchMatchHistory();
		matches = transformMatchData(backendMatches, userState.getUser()?.getId() || -1);
		if (matches.length < 1)
			throw new Error("No history yet...")
	}
	catch (err)
	{
		displayInfo(err instanceof Error ? err.message : "Failed to load match history");
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

function displayInfo(message: string): void
{
	const infoText = document.getElementById('match-history-info');
	if (!infoText)
		return;

	infoText.textContent = message;
	infoText.classList.remove('hidden');
	infoText.classList.add('flex');
}

function hideInfo(): void
{
	const infoText = document.getElementById('match-history-info');
	if (!infoText)
		return;

	infoText.classList.remove('flex');
	infoText.classList.add('hidden')
}

function displayHistoryGraph(matches: MatchHistory[])
{
	if (matches.length > 0)
	{
		const canvas = document.getElementById('dashboard-graph-canvas') as HTMLCanvasElement;
		if (!canvas)
			return;
		drawLineChart(canvas, matches);
		canvas.style.display = 'flex';
		hideInfo();
	}
	else
	{
		displayInfo('No match history to display...');
	}
}

function drawLineChart(canvas: HTMLCanvasElement, matches: MatchHistory[]): void
{
	const existingChart = Chart.getChart(canvas);
	if (existingChart) existingChart.destroy();

	const sortedMatches = [...matches].sort((a, b) =>
		new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	let cumulativeScore = 0;

	// Count matches per day first
	const matchesPerDay = new Map<string, number>();
	for (const match of sortedMatches) {
		const d = new Date(match.date);
		const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		matchesPerDay.set(dayKey, (matchesPerDay.get(dayKey) ?? 0) + 1);
	}

	// build clustered points with dynamic spacing
	const pointColors: string[] = [];
	const dataPoints: { x: Date; y: number; opponent: string }[] = [];
	const perDayCount = new Map<string, number>();
	const maxMatchesPerDay = Math.max(...matchesPerDay.values(), 1);

	if (sortedMatches.length > 0) {
		const firstDate = new Date(sortedMatches[0].date);
		const startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() - 2, 12, 0, 0, 0);
		dataPoints.push({ x: startDate, y: 0, opponent: '' });
		pointColors.push('transparent');
	}

	for (const match of sortedMatches) {
		const d = new Date(match.date);
		const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

		const idx = perDayCount.get(dayKey) ?? 0;
		perDayCount.set(dayKey, idx + 1);

		// more matches makes wider spacing
		const matchCount = matchesPerDay.get(dayKey) ?? 1;
		const baseOffset = 10;
		const dynamicOffset = baseOffset + (matchCount / maxMatchesPerDay) * 50;
		const offsetMinutes = dynamicOffset;

		// cluster around midday with dynamic minute offsets
		const clustered = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, idx * offsetMinutes, 0, 0);

		cumulativeScore += match.result === 'win' ? 1 : -1;
		dataPoints.push({ x: clustered, y: cumulativeScore, opponent: match.opponent });
		pointColors.push(match.result === 'win' ? '#aee2e9ff' : '#e28812ff');
	}

	// x-axis padding without extra points
	const first : Date = sortedMatches.length ? new Date(sortedMatches[0].date) : new Date();
	const last : Date = sortedMatches.length ? new Date(sortedMatches[sortedMatches.length - 1].date) : new Date();
	const xMin: number = new Date(first.getFullYear(), first.getMonth(), first.getDate() - 1, 0, 0, 0, 0).getTime();
	const xMax: number = new Date(last.getFullYear(),  last.getMonth(),  last.getDate() + 1, 23, 59, 59, 999).getTime();

	const ys = dataPoints.map(p => p.y);
	const yMax = ys.length ? Math.max(3, Math.max(...ys) + 1) : 1;
	const yMin = ys.length ? Math.min(-3, Math.min(...ys) - 1) : -1;

	const dataset: any = {
		label: 'Match Results',
		data: dataPoints,
		borderColor: '#d1d4daff',
		backgroundColor: 'transparent',
		borderWidth: 2,
		pointBackgroundColor: pointColors,
		pointBorderColor: pointColors,
		pointRadius: 6,
		pointHoverRadius: 8,
		stepped: 'before',
		tension: 0,
		fill: false,
		parsing: { xAxisKey: 'x', yAxisKey: 'y' },
	};

	const config: ChartConfiguration = {
		type: 'line',
		data: { datasets: [dataset] },
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false, labels: { color: '#9ca3af' } },
				title: { display: false },
				tooltip: {
					enabled: true,
					displayColors: false,
					titleFont: { size: 14, weight: 'bold' },
					bodyFont: { size: 13 },
					callbacks: {
						title: (items) => {
							const ts = items[0].parsed.x as number;
							return new Date(ts).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
						},
						label: (ctx) => {
							const raw = ctx.raw as any;
							return raw?.opponent ? `vs ${raw.opponent} • score ${ctx.parsed.y}` : `score ${ctx.parsed.y}`;
						}
					}
				}
			},
			scales: {
				x: {
					type: 'time',
					time: { unit: 'day', displayFormats: { day: 'MM/dd' } },
					min: xMin,
					max: xMax,
					ticks: {
						color: '#9ca3af',
						maxRotation: 45,
						minRotation: 45,
						font: { size: 20, weight: 'bold' }
					},
					grid: { color: '#2d3748' }
				},
				y: {
					beginAtZero: true,
					min: yMin,
					max: yMax,
					ticks: { color: '#9ca3af', stepSize: 1, font: { size: 12 } },
					grid: { color: '#2d3748' }
				}
			}
		}
	};

	new Chart(canvas, config);
}
