import { JSONMatchesResults } from '../config/schemas';
import { IResult } from '../config/pongData';

/************************************************************************************************************/

export { sendMatchesToDataBase }

/************************************************************************************************************/

function fillMatchesJSON(results: IResult, time?: number): JSONMatchesResults
{
	if (!results || !results.winner || !results.loser)
		throw new Error("GAME-SERVER: results not found, can't send matches results");

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
	try {
		if (!process.env.APP_SECRET_KEY)
			throw new Error("GAME-SERVER: 'APP_SECRET_KEY' not found");

		if (!results)
			throw new Error("GAME-SERVER: results not found, can't send matches results");

		const matchesURL: string = "https://localhost:8443/api/matches";
		const matchesJSON: JSONMatchesResults = fillMatchesJSON(results, time);
		const headers = {
			'Content-Type': 'application/json',
			'accept': '*/*',
			'X-App-Secret': process.env.APP_SECRET_KEY
		};

		const request = new Request(
			matchesURL,
			{
				method: 'POST',
				body: JSON.stringify(matchesJSON),
				headers: new Headers(headers)
			}
		);

		fetch(request)
			.then(async (response) => {
				const body = await response.text();
				try {
					const json = JSON.parse(body);
					console.log('backend api server response (json):', json);
				} catch {
					console.log('backend api server response (text):', body);
				}
				if (!response.ok) {
					console.error('HTTP error', response.status, response.statusText);
				}
			})
			.catch((error) => {
				console.error('network/fetch error', error);
			});
	} catch (error) {
		console.error(error);
	}
}