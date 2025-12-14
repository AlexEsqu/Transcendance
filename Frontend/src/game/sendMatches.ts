import { IRound } from "./Data";

export { sendMatchesPostRequest };

interface IJSON {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
}

function fillMatchesJSON(results: IRound, time?: number): IJSON {
	const date = new Date(time ?? Date.now());

	// get Id from Name
	let matches: IJSON = {
		winner_id: results.winner.id,
		loser_id: results.loser.id,
		winner_score: results.maxScore,
		loser_score: results.minScore,
		date: date.toISOString()
	};
	return matches;
}

function sendMatchesPostRequest(results: IRound, time?: number) : void {
	if (!results) {
		console.error("Results are undefined when sending matches POST request");
		return ;
	}

	const matchesURL: string = "https://localhost:8443/matches";
	const matchesJSON: IJSON = fillMatchesJSON(results, time);
	const request = new Request(
		matchesURL, 
		{
			method: 'POST',
			body: JSON.stringify(matchesJSON),
			headers: new Headers({
				'Content-Type': 'application/json',
				'accept': '*/*',
				'X-App-Secret': process.env.APP_SECRET_KEY
			})
		}
	);

	fetch(request)
		.then(async (res) => {
			const text = await res.text();
			try {
				const json = JSON.parse(text);
				console.log('server response (json):', json);
			} catch {
				console.log('server response (text):', text);
			}
			if (!res.ok) {
				console.error('HTTP error', res.status, res.statusText);
			}
		})
		.catch((err) => {
			console.error('network/fetch error', err);
		});
}