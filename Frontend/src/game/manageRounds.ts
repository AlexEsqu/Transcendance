import { IRound, State, IScene } from "./Data";
import { IPaddle, Pong } from "./Pong";

export { monitoringRounds, saveResults, newRound, drawMatchHistoryTree }

/***********************************************************************************************************/
/** MATCHES SYSTEM *****************************************************************************************/
/***********************************************************************************************************/

/**
 * 	- Check if any of the players have reached the maximum score
 */
function monitoringRounds(scene: IScene, roundIndex: number): boolean
{
	if (!scene || !scene.leftPadd.player || !scene.rightPadd.player) return false;

	if (scene.leftPadd.player.score == Pong.MAX_SCORE || scene.rightPadd.player.score == Pong.MAX_SCORE) {
		console.log("GAME-STATE: a player has won the round");
		if (roundIndex >= Pong.MAX_ROUNDS) scene.state = State.end;
		return true;
	}
	return false;
}

/**
 * 	- Save current round's results
 */
function saveResults(leftPadd: IPaddle, rightPadd: IPaddle, rounds: Array<IRound>): Array<IRound>
{
	if (!leftPadd.player || !rightPadd.player) return rounds;

	console.log("GAME-STATE: saving results");
	let results: IRound;
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
	if (!rounds)
		rounds = [ results ];
	else
		rounds.push(results);
	return rounds;
}

function newRound(scene: IScene, playerIndex: number, rounds: IRound[], roundIndex: number): number
{
	console.log("GAME-STATE: new round");

	const leftPadd = scene.leftPadd;
	const rightPadd = scene.rightPadd;
	const nbOfPlayers = scene.options.nbOfPlayers;

	//	Reset data
	if (leftPadd.paddle) leftPadd.paddle.resetPosition(Pong.MAP_WIDTH, "left");
	if (rightPadd.paddle) rightPadd.paddle.resetPosition(Pong.MAP_WIDTH, "right");
	scene.ball.reset(true);

	console.log(rounds);

	//	Who's playing now ?
	if (nbOfPlayers == 4 && roundIndex == (Pong.MAX_ROUNDS - 1)) {
		console.log(Pong.MAX_ROUNDS - 1);
		leftPadd.player = rounds[0].winner;
		rightPadd.player = rounds[1].winner;
	} else if (nbOfPlayers == 8 && roundIndex == (Pong.MAX_ROUNDS / 2)) {
		console.log( (Pong.MAX_ROUNDS / 2));

		leftPadd.player = rounds[0].winner;
		rightPadd.player = rounds[1].winner;
	} else if (nbOfPlayers == 8 && roundIndex == (Pong.MAX_ROUNDS / 2) + 1) {
		console.log( (Pong.MAX_ROUNDS / 2) + 1);

		leftPadd.player = rounds[2].winner;
		rightPadd.player = rounds[3].winner;
	} else if (nbOfPlayers == 8 && roundIndex == (Pong.MAX_ROUNDS - 1)) {
		console.log( (Pong.MAX_ROUNDS - 1));

		leftPadd.player = rounds[4].winner;
		rightPadd.player = rounds[5].winner;
	} else {
		if (playerIndex >= nbOfPlayers || roundIndex >= Pong.MAX_ROUNDS) return 0;
		console.log("begin round");
		leftPadd.player = scene.players[playerIndex];
		playerIndex++;
		rightPadd.player = scene.players[playerIndex];
		playerIndex++;
	}

	//	Update each player's name and score
	// leftPadd.nameText.text = leftPadd.player.name;
	// rightPadd.nameText.text = rightPadd.player.name;
	// leftPadd.scoreText.text = "0";
	// rightPadd.scoreText.text = "0";

	//	Update gameHistoryTree -- TO DO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	return 1;
}

/***********************************************************************************************************/
/** DISPLAY MATCH'S CURRENT HISTORY ************************************************************************/
/***********************************************************************************************************/

function drawCircle(ctx: CanvasRenderingContext2D, color: string, pos: { x: number, y: number }): void
{
	if (!ctx || !color || !pos) return ;

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2, true);
	ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D, color: string, 
	from: { x: number, y: number }, target: { x: number, y: number }): void
{
	if (!ctx || !color || !target) return ;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(target.x, target.y);
	ctx.stroke();
	ctx.closePath();
}

function drawMatchHistoryTree(canvas: HTMLCanvasElement, circleColors: Array<string>, lineColors: Array<string>): void
{
	const ctx = canvas.getContext("2d");
	const wCenter: number = canvas.width / 2;
	const hCenter: number = (canvas.height / 2);

	//	Left side
	drawCircle(ctx, circleColors[0], { x: wCenter - 150, y: hCenter - 50 });
	drawLine(ctx, lineColors[0], { x: wCenter - 70, y: hCenter }, { x: wCenter - 150, y: hCenter - 50 });
	drawCircle(ctx, circleColors[1], { x: wCenter - 150, y: hCenter + 50 });
	drawLine(ctx, lineColors[1], { x: wCenter - 70, y: hCenter }, { x: wCenter - 150, y: hCenter + 50 });
	//	Middle
	drawCircle(ctx, circleColors[4], { x: wCenter - 50, y: hCenter });
	drawLine(ctx, lineColors[2], { x: wCenter - 50, y: hCenter }, { x: wCenter + 50, y: hCenter });
	drawCircle(ctx, circleColors[5], { x: wCenter + 50, y: hCenter });
	//	Right side
	drawCircle(ctx, circleColors[2], { x: wCenter + 150, y: hCenter + 50 });
	drawCircle(ctx, circleColors[3], { x: wCenter + 150, y: hCenter - 50 });
	drawLine(ctx, lineColors[3], { x: wCenter + 70, y: hCenter }, { x: wCenter + 150, y: hCenter + 50 });
	drawLine(ctx, lineColors[4], { x: wCenter + 70, y: hCenter }, { x: wCenter + 150, y: hCenter - 50 });
}