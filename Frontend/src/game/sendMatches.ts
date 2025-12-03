import { IPlayer } from "./Pong";

export { sendMatchesPostRequest };

const matchesURL: string = "https://localhost:8443/matches";

interface IJSON {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
}

function fillMatchesJSON(winner: IPlayer, loser: IPlayer, time?: number): IJSON {
	const date = new Date(time ?? Date.now());

	let matches: IJSON = {
		winner_id: winner.id,
		loser_id: loser.id,
		winner_score: winner.score,
		loser_score: loser.score,
		date: date.toISOString()
	};
	return matches;
}

function sendMatchesPostRequest(winner: IPlayer | null | undefined,
								loser: IPlayer | null | undefined, time?: number) : void {
	if (!winner || !loser) {
		console.error("IPlayer is undefined when sending matches POST request");
		return ;
	}

	const matchesJSON: IJSON = fillMatchesJSON(winner, loser, time);
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