import { IRound, State, IScene, IResult } from "./Data";
import { IPaddle, Pong } from "./Pong";

export { monitoringRounds, saveResults, newRound, drawMatchHistoryTree, drawScore, drawName }

/***********************************************************************************************************/
/** MATCHES SYSTEM *****************************************************************************************/
/***********************************************************************************************************/

/**
 * 	- Returns 'true' if one of the players has reached the maximum score, otherwise false
 * 	- Returns 'true' if one of the players has reached the maximum score, otherwise false
 */
function monitoringRounds(scene: IScene, nbOfRounds: number): boolean
{
	if (!scene || !scene.leftPadd || !scene.leftPadd.player || !scene.rightPadd || !scene.rightPadd.player) return false;

	if (scene.leftPadd.player.score == Pong.MAX_SCORE || scene.rightPadd.player.score == Pong.MAX_SCORE)
	{
		console.log("GAME-STATE: a player has won the round");
		//	The game should stop if all the rounds have been played!
		if (nbOfRounds >= Pong.MAX_ROUNDS) scene.state = State.end;
		return true;
	}
	return false;
}

/**
 * 	- Save current round's results
 */
function saveResults(leftPadd: IPaddle, rightPadd: IPaddle, rounds: IRound): IRound
{
	if (!leftPadd.player || !rightPadd.player) return rounds;
	console.log("GAME-STATE: saving results");

	let results: IResult;
	if (leftPadd.player.score == Pong.MAX_SCORE) {
		results = {
			winner: leftPadd.player,
			maxScore: leftPadd.player.score,
			loser: rightPadd.player,
			minScore: rightPadd.player.score
		};
	} else {
		results = {
			winner: rightPadd.player,
			maxScore: rightPadd.player.score,
			loser: leftPadd.player,
			minScore: leftPadd.player.score
		};
	}
	if (!rounds.results)
		rounds.results = [ results ];
	else
		rounds.results.push(results);

	return rounds;
}

function newRound(scene: IScene, rounds: IRound): IRound
{
	if (!scene || (rounds && rounds.nbOfRounds == Pong.MAX_ROUNDS)) return rounds;

	const leftPadd = scene.leftPadd;
	const rightPadd = scene.rightPadd;

	if (!leftPadd || !rightPadd) {
		console.error("objects are missing to launch a new round");
		return rounds;
	}
	console.log("GAME-STATE: new round");

	//	Who's playing now ?
	let nbOfPlayers = scene.options.nbOfPlayers;
	if (nbOfPlayers == 4 && rounds.nbOfRounds >= 0 && rounds.nbOfRounds < 2) nbOfPlayers = 2;
	// else if (nbOfPlayers == 8 && rounds.nbOfRounds >= 0 && rounds.nbOfRounds < 4) nbOfPlayers = 2;

	if (nbOfPlayers == 4 && rounds.results && rounds.nbOfRounds == Pong.MAX_ROUNDS - 1) {
		// console.log("4 players last round");
		if (rounds.results[0]) leftPadd.player = rounds.results[0].winner;
		if (rounds.results[1]) rightPadd.player = rounds.results[1].winner;
	} else if (scene.players) {
		console.log("default assign");
		if (nbOfPlayers != 1 && rounds.playerIndex >= scene.options.nbOfPlayers) return rounds;
		leftPadd.player = scene.players[rounds.playerIndex];
		rounds.playerIndex++;
		rightPadd.player = scene.players[rounds.playerIndex];
		rounds.playerIndex++;
	}
	/** Condition if 8 players for a tournament */
	// if (nbOfPlayers == 8 && rounds.nbOfRounds == Pong.MAX_ROUNDS / 2) {
	// 	leftPadd.player = rounds.results[0].winner;
	// 	rightPadd.player = rounds.results[1].winner;
	// } else if (rounds.nbOfRounds == (Pong.MAX_ROUNDS / 2) + 1) {
	// 	leftPadd.player = rounds.results[2].winner;
	// 	rightPadd.player = rounds.results[3].winner;
	// } else if (rounds.nbOfRounds == Pong.MAX_ROUNDS - 1) {
	// 	leftPadd.player = rounds.results[4].winner;
	// 	rightPadd.player = rounds.results[5].winner;
	// }

	console.log(leftPadd);
	console.log(rightPadd);
	//	Reset data
	if (scene.ball) scene.ball.reset(true);
	leftPadd.paddle.resetPosition(Pong.MAP_WIDTH, "left");
	rightPadd.paddle.resetPosition(Pong.MAP_WIDTH, "right");
	if (leftPadd.player) leftPadd.player.score = 0;
	if (rightPadd.player) rightPadd.player.score = 0;

	// let leftIndex = 0;
	// let rightIndex = 1;
	// if (rounds.nbOfRounds >= 1) {
	// 	leftIndex = rounds.nbOfRounds + 1;
	// 	rightIndex = rounds.nbOfRounds + 2;
	// }

	// if (rounds.nodeColor[leftIndex]) rounds.nodeColor[leftIndex] = leftPadd.player.color;
	// if (rounds.nodeColor[rightIndex]) rounds.nodeColor[rightIndex] = rightPadd.player.color;

	scene.leftPadd = leftPadd;
	scene.rightPadd = rightPadd;

	return rounds;
}

/***********************************************************************************************************/
/** DISPLAY MATCH'S CURRENT HISTORY ************************************************************************/
/***********************************************************************************************************/

function drawCircle(ctx: CanvasRenderingContext2D, color: string, pos: { x: number, y: number }): void
{
	if (!ctx || !color || !pos) return ;

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2, true);
	ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D, color: string,
	from: { x: number, y: number }, target: { x: number, y: number }): void
{
	if (!ctx || !color || !target) return ;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(target.x, target.y);
	ctx.stroke();
	ctx.closePath();
}

function drawCrown(canvas: HTMLCanvasElement, color: string): void
{
	const ctx = canvas.getContext("2d");
	if (!ctx) return ;

	const wCenter: number = (canvas.width / 2);
	const hCenter: number = (canvas.height / 2) + 400;

	drawLine(ctx, color, { x: wCenter - 10, y: hCenter + 70 }, { x: wCenter + 10, y: hCenter + 70 });
	drawLine(ctx, color, { x: wCenter - 10, y: hCenter + 70 }, { x: wCenter - 10, y: hCenter + 50 });
	drawLine(ctx, color, { x: wCenter + 10, y: hCenter + 70 }, { x: wCenter + 10, y: hCenter + 50 });
	for (let i = 0; i < 3; i++) {
		drawLine(ctx, color, { x: wCenter - 10, y: hCenter + 70 }, { x: wCenter - 10, y: hCenter + 50 });

	}
}

function drawOneBranch(
	canvas: HTMLCanvasElement, rounds: IRound, nbOfPlayer: number): void
{
	const ctx = canvas.getContext("2d");
	if (!ctx) return ;

	const defaultColor = "rgba(141, 188, 255, 0.7)";
	const wCenter: number = (canvas.width / 2);
	const hCenter: number = (canvas.height / 2) + 400;
	ctx.clearRect(wCenter - 110, 0, 220, hCenter + 100);

	if (rounds.results && rounds.nbOfRounds == Pong.MAX_ROUNDS && rounds.results[0].winner && rounds.results[1].winner) {
		drawCircle(ctx, rounds.results[0].winner.color, { x: wCenter - 30, y: hCenter });
		drawCircle(ctx, rounds.results[1].winner.color, { x: wCenter + 30, y: hCenter });
	}
	else if (rounds.nodeColor[4] && rounds.nodeColor[5]) {
		drawCircle(ctx, rounds.nodeColor[4], { x: wCenter - 30, y: hCenter });
		drawCircle(ctx, rounds.nodeColor[5], { x: wCenter + 30, y: hCenter });
	}
	drawLine(ctx, defaultColor, { x: wCenter - 15, y: hCenter }, { x: wCenter + 15, y: hCenter });


	// drawLine(ctx, defaultColor, { x: wCenter, y: hCenter }, { x: wCenter, y: hCenter + 30 });
	// drawCrown(canvas, defaultColor);
}

function drawTwoBranch(
	canvas: HTMLCanvasElement, rounds: IRound, first: boolean): void
{
	const ctx = canvas.getContext("2d");
	if (!ctx) return ;

	const defaultColor = "rgba(141, 188, 255, 0.7)";
	const wCenter: number = (canvas.width / 2);
	let hCenter: number = (canvas.height / 2) + 400;
	if (!first) hCenter += 100;

	//	Left side
	drawCircle(ctx, rounds.nodeColor[0], { x: wCenter - 100, y: hCenter - 30 });
	drawLine(ctx, defaultColor, { x: wCenter - 45, y: hCenter }, { x: wCenter - 87, y: hCenter - 25});

	drawCircle(ctx, rounds.nodeColor[1], { x: wCenter - 100, y: hCenter + 30 });
	drawLine(ctx, defaultColor, { x: wCenter - 45, y: hCenter }, { x: wCenter - 87, y: hCenter + 25 });

	//	Right side
	drawCircle(ctx, rounds.nodeColor[3], { x: wCenter + 100, y: hCenter + 30 });
	drawLine(ctx, defaultColor, { x: wCenter + 45, y: hCenter }, { x: wCenter + 87, y: hCenter + 25 });

	drawCircle(ctx, rounds.nodeColor[2], { x: wCenter + 100, y: hCenter - 30 });
	drawLine(ctx, defaultColor, { x: wCenter + 45, y: hCenter }, { x: wCenter + 87, y: hCenter - 25 });
}

function drawMatchHistoryTree(
	canvas: HTMLCanvasElement, rounds: IRound, nbPlayers: number): void
{
	if (nbPlayers == 4) {
		drawOneBranch(canvas, rounds, nbPlayers);
		drawTwoBranch(canvas, rounds, true);
	}
	else if (nbPlayers == 8) {
		drawOneBranch(canvas, rounds, nbPlayers);
		drawTwoBranch(canvas, rounds, true);
		drawOneBranch(canvas, rounds, nbPlayers);
		drawTwoBranch(canvas, rounds, false);
	}
}

function drawScore(canvas: HTMLCanvasElement | null, score1: number, score2: number): void
{
	const player1Score = document.getElementById('player1-score');
	const player2Score = document.getElementById('player2-score');

	if (player1Score)
		player1Score.textContent = score1.toString();
	
	if (player2Score)
		player2Score.textContent = score2.toString();
}

function drawName(canvas: HTMLCanvasElement, player1: string, player2: string, nbRound: number): void
{
	const ctx = canvas.getContext("2d");
	if (!ctx || !player2 || !player1) {
		console.error("can't draw name, element not found");
		return ;
	}
	if (player1.length > 10) player1 = player1.substring(0, 10);
	if (player2.length > 10) player2 = player2.substring(0, 10);

	const wCenter: number = (canvas.width / 2);
	const hCenter: number = (canvas.height / 2) - 200;
	ctx.clearRect(wCenter - 200, 0, 400, 500);
	ctx.clearRect(wCenter + 200, 0, 400, 500);

	ctx.font = "20px monospace";
	ctx.fillStyle = "rgba(141, 188, 255, 1)";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillText(player1, wCenter - 200, hCenter);
	ctx.fillText(player2, wCenter + 200, hCenter);
}
