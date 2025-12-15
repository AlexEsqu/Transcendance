import { IRound, State } from "./Data";
import { Pong } from "./Pong";

export { monitoringRounds, saveResults, newRound, drawMatchHistoryTree }

/***********************************************************************************************************/
/** MATCH SYSTEM *******************************************************************************************/
/***********************************************************************************************************/

/**
 * 	- Check if any of the players have reached the maximum score
 */
function monitoringRounds(roundIndex: number): boolean {
	if (!this.leftPadd.player || !this.rightPadd.player) return false;

	if (this.leftPadd.player.score == Pong.MAX_SCORE || this.rightPadd.player.score == Pong.MAX_SCORE) {
		console.log("GAME-STATE: a player has won the round");
		if (roundIndex >= Pong.MAX_ROUNDS) this.state = State.end;
		return true;
	}
	return false;
}

/**
 * 	- Save current round's results
 */
function saveResults(rounds: Array<IRound>): Array<IRound> {
	if (!this.leftPadd.player || !this.rightPadd.player) return rounds;

	console.log("GAME-STATE: saving results");
	let results: IRound;
	if (this.leftPadd.player.score == Pong.MAX_SCORE) {
		results = {
			winner: this.leftPadd.player,
			maxScore: this.leftPadd.player.score,
			loser: this.rightPadd.player,
			minScore: this.rightPadd.player.score
		};
	} else {
		results = {
			winner: this.rightPadd.player,
			maxScore: this.rightPadd.player.score,
			loser: this.leftPadd.player,
			minScore: this.leftPadd.player.score
		};
	}
	if (!rounds)
		rounds = [ results ];
	else
		rounds.push(results);
	return rounds;
}

function newRound(playerIndex: number, rounds: IRound[], roundIndex: number): number {
	console.log("GAME-STATE: new round");

	//	Reset data
	this.leftPadd.paddle.resetPosition(Pong.MAP_WIDTH, "left");
	this.rightPadd.paddle.resetPosition(Pong.MAP_WIDTH, "right");
	this.ball.reset(true);

	console.log(rounds);

	//	Who's playing now ?
	if (this.options.nbOfPlayer == 4 && roundIndex == (Pong.MAX_ROUNDS - 1)) {
		console.log("NEW round 4 players and last round");
		this.leftPadd.player = rounds[0].winner;
		this.rightPadd.player = rounds[1].winner;
	} else if (this.options.nbOfPlayer == 8 && roundIndex == (Pong.MAX_ROUNDS / 2)) {
		this.leftPadd.player = rounds[0].winner;
		this.rightPadd.player = rounds[1].winner;
	} else if (this.options.nbOfPlayer == 8 && roundIndex == (Pong.MAX_ROUNDS / 2) + 1) {
		this.leftPadd.player = rounds[2].winner;
		this.rightPadd.player = rounds[3].winner;
	} else if (this.options.nbOfPlayer == 8 && roundIndex == (Pong.MAX_ROUNDS - 1)) {
		this.leftPadd.player = rounds[4].winner;
		this.rightPadd.player = rounds[5].winner;
	} else {
		if (playerIndex >= this.options.nbOfPlayer || roundIndex >= Pong.MAX_ROUNDS) return 0;
		console.log("NEW round first");
		this.leftPadd.player = this.players[playerIndex];
		playerIndex++;
		this.rightPadd.player = this.players[playerIndex];
		playerIndex++;
	}

	//	Update each player's name and score
	this.leftPadd.nameText.text = this.leftPadd.player.name;
	this.rightPadd.nameText.text = this.rightPadd.player.name;
	this.leftPadd.scoreText.text = "0";
	this.rightPadd.scoreText.text = "0";

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