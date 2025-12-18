import { IRound, State, IScene, IResult } from "./Data";
import { IPaddle, Pong } from "./Pong";

export { monitoringRounds, saveResults, newRound, drawMatchHistoryTree, drawScore, drawName }

/***********************************************************************************************************/
/** MATCHES SYSTEM *****************************************************************************************/
/***********************************************************************************************************/

/**
 * 	- Check if any of the players have reached the maximum score
 */
function monitoringRounds(scene: IScene, nbOfRounds: number): boolean
{
	if (!scene || !scene.leftPadd.player || !scene.rightPadd.player) return false;

	if (scene.leftPadd.player.score == Pong.MAX_SCORE || scene.rightPadd.player.score == Pong.MAX_SCORE)
	{
		console.log("GAME-STATE: a player has won the round");
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
	console.log("GAME-STATE: new round");

	const leftPadd = scene.leftPadd;
	const rightPadd = scene.rightPadd;
	let nbOfPlayers = scene.options.nbOfPlayers;

	//	Who's playing now ?
	if (nbOfPlayers == 4 && rounds.nbOfRounds >= 0 && rounds.nbOfRounds < 2) nbOfPlayers = 2;
	else if (nbOfPlayers == 8 && rounds.nbOfRounds >= 0 && rounds.nbOfRounds < 4) nbOfPlayers = 2;

	switch (nbOfPlayers)
	{
		case 4:
			if (rounds.nbOfRounds == Pong.MAX_ROUNDS - 1) {
				leftPadd.player = rounds.results[0].winner;
				rightPadd.player = rounds.results[1].winner;
			}
			break ;
		case 8:
			if (rounds.nbOfRounds == Pong.MAX_ROUNDS / 2) {
				leftPadd.player = rounds.results[0].winner;
				rightPadd.player = rounds.results[1].winner;
			} else if (rounds.nbOfRounds == (Pong.MAX_ROUNDS / 2) + 1) {
				leftPadd.player = rounds.results[2].winner;
				rightPadd.player = rounds.results[3].winner;
			} else if (rounds.nbOfRounds == Pong.MAX_ROUNDS - 1) {
				leftPadd.player = rounds.results[4].winner;
				rightPadd.player = rounds.results[5].winner;
			}
			break ;
		default:
			if (rounds.playerIndex >= scene.options.nbOfPlayers) return rounds;
			leftPadd.player = scene.players[rounds.playerIndex];
			rounds.playerIndex++;
			rightPadd.player = scene.players[rounds.playerIndex];
			rounds.playerIndex++;
			break ;
	}

	//	Reset data
	if (leftPadd.paddle) leftPadd.paddle.resetPosition(Pong.MAP_WIDTH, "left");
	if (rightPadd.paddle) rightPadd.paddle.resetPosition(Pong.MAP_WIDTH, "right");
	scene.ball.reset(true);
	leftPadd.player.score = 0;
	rightPadd.player.score = 0;

	let leftIndex = 0;
	let rightIndex = 1;
	if (rounds.nbOfRounds >= 2) {
		leftIndex = rounds.nbOfRounds - 2;
		rightIndex = rounds.nbOfRounds - 1;
	}
	rounds.nodeColor[leftIndex] = leftPadd.player.color;
	rounds.nodeColor[rightIndex] = rightPadd.player.color;

	for (let i = 0; i < 4; i++)
		console.log(rounds.nodeColor[i]);
	
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
	canvas: HTMLCanvasElement, rounds: IRound): void
{
	const ctx = canvas.getContext("2d");
	if (!ctx) return ;

	const defaultColor = "rgba(141, 188, 255, 0.7)";
	const wCenter: number = (canvas.width / 2);
	const hCenter: number = (canvas.height / 2) + 400;
	ctx.clearRect(wCenter - 110, 0, 220, hCenter + 100);

	drawCircle(ctx, rounds.nodeColor[4], { x: wCenter - 30, y: hCenter });
	drawLine(ctx, defaultColor, { x: wCenter - 30, y: hCenter }, { x: wCenter + 30, y: hCenter });
	drawCircle(ctx, rounds.nodeColor[5], { x: wCenter + 30, y: hCenter });

	drawLine(ctx, defaultColor, { x: wCenter, y: hCenter }, { x: wCenter, y: hCenter + 30 });
	drawCrown(canvas, defaultColor);
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
	drawLine(ctx, defaultColor, { x: wCenter - 30, y: hCenter }, { x: wCenter - 100, y: hCenter - 30 });

	drawCircle(ctx, rounds.nodeColor[1], { x: wCenter - 100, y: hCenter + 30 });
	drawLine(ctx, defaultColor, { x: wCenter - 30, y: hCenter }, { x: wCenter - 100, y: hCenter + 30 });

	//	Right side
	drawCircle(ctx, rounds.nodeColor[2], { x: wCenter + 100, y: hCenter + 30 });
	drawLine(ctx, defaultColor, { x: wCenter + 30, y: hCenter }, { x: wCenter + 100, y: hCenter + 30 });

	drawCircle(ctx, rounds.nodeColor[3], { x: wCenter + 100, y: hCenter - 30 });
	drawLine(ctx, defaultColor, { x: wCenter + 30, y: hCenter }, { x: wCenter + 100, y: hCenter - 30 });
}

function drawMatchHistoryTree(
	canvas: HTMLCanvasElement, rounds: IRound, nbPlayers: number): void
{
	if (nbPlayers == 1 || nbPlayers == 2)
		drawOneBranch(canvas, rounds);
	else if (nbPlayers == 4) {
		drawOneBranch(canvas, rounds);
		drawTwoBranch(canvas, rounds, true);
	}
	else if (nbPlayers == 8) {
		drawOneBranch(canvas, rounds);
		drawTwoBranch(canvas, rounds, true);
		drawOneBranch(canvas, rounds);
		drawTwoBranch(canvas, rounds, false);
	}
}

function drawScore(canvas: HTMLCanvasElement, score1: number, score2: number): void
{
	const ctx = canvas.getContext("2d");
	const wCenter: number = (canvas.width / 2);
	const hCenter: number = (canvas.height / 2) - 300;
	ctx.clearRect(wCenter - 110, 0, 220, hCenter + 50);

	ctx.font = "50px monospace";
	ctx.fillStyle = "rgba(141, 188, 255, 1)";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillText(score1.toString(), wCenter - 70, hCenter);
	ctx.fillText("|", wCenter, hCenter);
	ctx.fillText(score2.toString(), wCenter + 70, hCenter);
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
	const hCenter: number = (canvas.height / 2) - 300;
	ctx.clearRect(wCenter - 200, 0, 200, 855);
	ctx.clearRect(wCenter + 200, 0, 200, 855);

	ctx.font = "20px monospace";
	ctx.fillStyle = "rgba(141, 188, 255, 1)";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	ctx.fillText(player1, wCenter - 200, hCenter);
	ctx.fillText(player2, wCenter + 200, hCenter);
	ctx.fillStyle = "rgba(201, 34, 145, 1)";
}