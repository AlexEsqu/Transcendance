import { userState } from "../app";
import { Chart, ChartConfiguration, registerables } from 'chart.js';

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
		console.log(`found history: ${matches}`);
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
	if (existingChart)
		existingChart.destroy();

	const sortedMatches = [...matches].sort((a, b) =>
		new Date(a.date).getTime() - new Date(b.date).getTime()
	);

    let cumulativeScore = 0;
    const labels: string[] = [];
    const scoreData: number[] = [];
    const pointColors: string[] = [];

	// add 2 days before first match at score 0 for padding
    if (sortedMatches.length > 0) {
        const firstDate = new Date(sortedMatches[0].date);
        for (let i = 2; i > 0; i--) {
            const date = new Date(firstDate);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            scoreData.push(0);
            pointColors.push('transparent');
        }
    }

	sortedMatches.forEach((match, index) =>
		{
			cumulativeScore += match.result === 'win' ? 1 : -1;

			const date = new Date(match.date);
            const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
			labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
			scoreData.push(cumulativeScore);
			pointColors.push(match.result === 'win' ? '#aee2e9ff' : '#e28812ff');
		}
	);

	// auto expand to at leasst -3 to 3, and else +1 to the score
	const maxScore = Math.max(...scoreData);
	const minScore = Math.min(...scoreData);
	const yMax = Math.max(3, maxScore + 1);
	const yMin = Math.min(-3, minScore - 1);

	const config: ChartConfiguration = {
		type: 'line',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'Match Results',
					data: scoreData,
					borderColor: '#d1d4daff',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					borderWidth: 2,
					pointBackgroundColor: pointColors,
					pointBorderColor: pointColors,
					pointRadius: 6,
					pointHoverRadius: 8,
					stepped: 'after',
					tension: 0,
					fill: true
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
					labels: {
						color: '#9ca3af'
					}
				},
				title: {
					display: false,
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					min: yMin,
					max: yMax,
					ticks: {
						color: '#9ca3af',
						stepSize: 1,
					},
					grid: {
						color: '#2d3748'
					}
				},
				x: {
					ticks: {
						color: '#9ca3af',
						maxRotation: 45,
                        minRotation: 45,
					},
					min: 0,
					grid: {
						color: '#2d3748'
					},
					// offset: true,
					// grace: '15%',
				}
			}
		}
	};

	new Chart(canvas, config);
}
