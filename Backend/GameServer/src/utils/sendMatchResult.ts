import { JSONMatchesResults } from '../config/schemas';
import { IResult } from '../config/pongData';

/************************************************************************************************************/

export { sendMatchesToDataBase }

/************************************************************************************************************/

function fillMatchesJSON(results: IResult, time?: number): JSONMatchesResults | null
{
	if (!results || !results.winner || !results.loser) return null;

	const date = new Date(time ?? Date.now());

	// get Id from Name
	let matches: JSONMatchesResults = {
		winner_id: results.winner.id,
		loser_id: results.loser.id,
		winner_score: results.maxScore,
		loser_score: results.minScore,
		date: date.toISOString()
	};
	return matches;
}

function sendMatchesToDataBase(results: IResult | null, time?: number): void
{
	if (!results) {
		console.error("Results are not found when sending matches POST request to backend");
		return ;
	}

	if (!process.env.APP_SECRET_KEY) return ;
	const args = {
		'Content-Type': 'application/json',
		'accept': '*/*',
		'X-App-Secret': process.env.APP_SECRET_KEY
	};

	const matchesURL: string = "https://localhost:8443/matches";
	const matchesJSON: JSONMatchesResults | null = fillMatchesJSON(results, time);
	if (!matchesJSON) return ;

	const request = new Request(
		matchesURL,
		{
			method: 'POST',
			body: JSON.stringify(matchesJSON),
			headers: new Headers(args)
		}
	);

	fetch(request)
		.then(async (response) => {
			const text = await response.text();
			try {
				const json = JSON.parse(text);
				console.log('server response (json):', json);
			} catch {
				console.log('server response (text):', text);
			}
			if (!response.ok) {
				console.error('HTTP error', response.status, response.statusText);
			}
		})
		.catch((error) => {
			console.error('network/fetch error', error);
		});
}