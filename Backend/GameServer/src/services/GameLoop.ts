import { isBallHittingWall, isBallHittingPaddle, isBallOutOfBounds, isNewPaddPosHittingMapLimit,
	adjustBallHorizontalPos, adjustBallVerticalPos, scaleVelocity, normalizeVector, processRobotOpponent
} from '../utils/physics';

import { GAME_SIZE, IBall, IPaddle, IPlayer, State, MatchType, IRound, IResult, Info, GameSatus } from '../config/pongData'
import { initBall, initPadd, initPlayers, initInfoByLevel } from '../utils/init'
import { notifyPlayersInRoom } from '../utils/broadcast';
import { JSONGameState } from '../config/schemas';
import { GameControl } from './GameControl';
import { Room } from './Room';
import { sendMatchesToDataBase } from '../utils/sendMatchResult';

/************************************************************************************************************/

export class GameLoop
{
	INFO: Info;

	roomId: number;
	matchType: MatchType;
	ball: IBall;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	rounds: IRound;
	players: Array<IPlayer>;
	state: State;
	timestamp: number;

	constructor(roomId: number, matchType: MatchType, players: Map<string, IPlayer>, level: number)
	{
		this.INFO = initInfoByLevel(level, matchType);
		this.roomId = roomId;
		this.matchType = matchType;
		this.ball = initBall(this.INFO.BALL_START_SPEED);
		this.leftPadd = initPadd(matchType, 'left');
		this.rightPadd = initPadd(matchType, 'right');
		this.players = initPlayers(players);
		this.rounds = { results: null, waitingPlayers: this.players, nbOfRounds: 0 };
		this.requestNewRound();
		this.state = State.waiting;
		this.timestamp = -1;
		console.log(this.INFO);
	}

	runGameLoop(gameControl: GameControl): void
	{
		const room: Room | undefined = gameControl.getGamingRoom(this.roomId);
		if (room === undefined) return ; // TO DO: HANDLE ERROR LATER

		let isNewRound: boolean = false;
		let gameStateInfo: JSONGameState;
		let robotInterval: NodeJS.Timeout;

		console.log("GAME-LOOP: game loop started");
		//	Take 1 sec to be sure every players are ready
		setTimeout(() => {
			const gameInterval = setInterval(() => {
				// console.log(this.state);

				if (this.state === State.end)
				{
					clearInterval(gameInterval);
					// clearInterval(robotInterval);
					if (this.rounds.results)
						sendMatchesToDataBase(this.rounds.results[this.rounds.results.length - 1], Date.now());
					room.closeRoom();
					return ;
				}

				if (this.state === State.play)
				{
					//	update data & check collisions
					this.updateGameData();
					// robotInterval = setInterval(() => {
					// 	if (this.leftPadd.robot && this.state === State.play)
					// 		this.processPlayerInput('Robot', this.state, processRobotOpponent(this.leftPadd, this.ball, this.INFO.BOT_PROBABILITY));
					// }, 1000);
					//	monitor score/rounds
					isNewRound = this.isPlayerHittingMaxScore();
				}

				if (isNewRound)
				{
					this.requestNewRound();
					isNewRound = false;
				}

				//	broadcast to players = send game state/data to all players
				gameStateInfo = this.composeGameState();
				notifyPlayersInRoom(room, gameStateInfo);

				this.timestamp = Date.now();
			}, 1000 / 60); // 60fps
		}, 100);
	}

	updateGameData(): void
	{
		//	Move the ball position according to its direction and velocity
		const deltaTime: number = this.timestamp !== -1 ? ((Date.now() - this.timestamp) / 1000) : 0;
		const velocity = scaleVelocity(this.ball, deltaTime);
		this.ball.posistion.x += velocity.x;
		this.ball.posistion.z += velocity.z;

		//	Check if the ball hits the edge of map/paddles or is out of bounds -> update its direction accordingly
		//	Depending on what/where the ball hits an object or a limit, its direction is reversed and gains speed
		this.bouncingBallProcess();

		if (this.leftPadd.robot)
			this.processPlayerInput('Robot', this.state, processRobotOpponent(this.leftPadd, this.ball, this.INFO.BOT_PROBABILITY));
	}

	bouncingBallProcess(): boolean
	{
		if (isBallHittingPaddle(this.ball, this.leftPadd) || isBallHittingPaddle(this.ball, this.rightPadd))
		{
			//	Invert X direction
			this.ball.posistion.x = adjustBallHorizontalPos(this.ball);
			this.ball.direction.x = -(this.ball.direction.x);

			const ballLeftEdge = this.ball.posistion.x - GAME_SIZE.BALL_RADIUS;
			//	Avoid repeating trajectories, increase angle (Z-axis) if the ball hits top/down edge of the paddle
			if (ballLeftEdge <= 0)
				this.ball.direction.z = (this.ball.posistion.z - this.leftPadd.pos.z) / GAME_SIZE.PADD_WIDTH;
			else
				this.ball.direction.z = (this.ball.posistion.z - this.rightPadd.pos.z) / GAME_SIZE.PADD_WIDTH;
			//	Increase again the angle (less predictable) --- is necessary ??
			this.ball.direction.z *= 1.01;
			//	Add random noise to trajectories (avoid perfect loop, less predictable, better gameplay)
			const random = (Math.random() - 0.4) * 0.03;
			this.ball.direction.z += random;

			//	Normalize direction's vector (stabilizes physics, sightly rendering)
			this.ball.direction = normalizeVector(this.ball.direction);

			//	Increase gradually the speed
			this.ball.speed = Math.min(this.INFO.BALL_MAX_SPEED, this.ball.speed * 1.2);

			return false;
		}

		if (isBallHittingWall(this.ball))
		{
			this.ball.direction.z = -(this.ball.direction.z);
			this.ball.posistion.z = adjustBallVerticalPos(this.ball);
		}

		if (isBallOutOfBounds(this.ball))
		{
			console.log(`GAME-LOOP: ball is out of bounds ${this.ball.posistion.x} at ${this.timestamp}`);
			if (this.ball.posistion.x > 0)
				this.leftPadd.score += 1;
			else
				this.rightPadd.score += 1;
			this.resetBall();
			return true;
		}
		return false;
	}

	processPlayerInput(player: string, state: number, input: string): void
	{
		let paddle: IPaddle;

		this.state = State.play;

		if (this.leftPadd.player?.username === player)
			paddle = this.leftPadd;
		else if (this.rightPadd.player?.username === player)
			paddle = this.rightPadd;
		else {
			// console.error(`(GAME-LOOP: can't process player's received input, no matches found with ${player} and players currently in round`);
			return ;
		}

		const deltaTime: number = this.timestamp === -1 ? 0 : (Date.now() - this.timestamp) / 1000;
		//	Frame-rate independent smoothing
        // const alpha: number = 1 - Math.exp(this.INFO.PADD_RESPONSIVENESS * deltaTime);
		//	Calculate the velocity of the paddle's movement
		const velocityStep: number = this.INFO.PADD_SPEED * deltaTime;

		if (input === 'up' && !isNewPaddPosHittingMapLimit(paddle.pos.z, velocityStep, input))
			paddle.pos.z += velocityStep;
		else if (input === 'down' && !isNewPaddPosHittingMapLimit(paddle.pos.z, velocityStep, input))
			paddle.pos.z -= velocityStep;
	}

	isPlayerHittingMaxScore(): boolean
	{
		if (this.leftPadd.player === undefined || this.rightPadd.player === undefined)
			return false;

		if (this.leftPadd.score === this.INFO.MAX_SCORE || this.rightPadd.score === this.INFO.MAX_SCORE)
		{
			this.state = State.waiting;
			if (this.rounds.nbOfRounds >= this.INFO.MAX_ROUNDS)
				this.state = State.end;
			return true;
		}
		return false;
	}

	/**
	 * 	Save the match's result & prepare the next match
	 */
	requestNewRound(): GameSatus
	{
		//	If it's not the game's end players must wait that everyone is ready for the new round
		if (this.state !== State.end)
			this.state = State.waiting;

		//	Save the results of the previous match, if there was one
		if (this.rounds.nbOfRounds !== 0)
			this.saveResults();

		if (this.state === State.end)
			return GameSatus.SUCCESS;

		//	Who should play now ?
		let match = this.matchType;
		if (match === MatchType.tournament && this.rounds.nbOfRounds >= 0 && this.rounds.nbOfRounds < 2)
			match = MatchType.duo;
		//	If the match type is a tournament and it's the final round, the last two players must be the two winners of the previous rounds
		if (match === MatchType.tournament && this.rounds.nbOfRounds === this.INFO.MAX_ROUNDS - 1)
		{
			if (!this.rounds.results || !this.rounds.results[0] || !this.rounds.results[1]) {
				console.error("GAME-LOOP: failed to assign players to new round, previous match's results not found");
				return GameSatus.ERROR;
			}
			this.leftPadd.player = this.rounds.results[0].winner;
			this.rightPadd.player = this.rounds.results[1].winner;
		}
		else if (this.rounds.waitingPlayers)
		{
			this.leftPadd.player = this.rounds.waitingPlayers.pop();
			this.rightPadd.player = this.rounds.waitingPlayers.pop();
		}
		this.rounds.nbOfRounds += 1;
		console.log("GAME-LOOP: new round n`", this.rounds.nbOfRounds);

		//	Reset game's data
		this.resetBall();
		this.resetPaddles();

		if (this.leftPadd.player === undefined || this.rightPadd.player === undefined)
			return GameSatus.ERROR;

		//	If a player is disconnected, opponent wins
		if (this.leftPadd.player?.socket === null)
			this.rightPadd.score = this.INFO.MAX_SCORE;
		else if (this.rightPadd.player?.socket === null)
			this.leftPadd.score = this.INFO.MAX_SCORE;

		return GameSatus.SUCCESS;
	}

	/**
	 *	Save current round's results
	*/
	saveResults(): void
	{
		const winner: IPaddle = this.leftPadd.score === this.INFO.MAX_SCORE ? this.leftPadd : this.rightPadd;
		const loser: IPaddle = this.leftPadd.score === this.INFO.MAX_SCORE ? this.rightPadd : this.leftPadd;

		if (winner.player === undefined || loser.player === undefined)
			return ;

		const results: IResult = {
			winner: winner.player,
			maxScore: winner.score,
			loser: loser.player,
			minScore: loser.score
		};

		if (!this.rounds.results)
			this.rounds.results = [ results ];
		else
			this.rounds.results?.push(results);

		console.log(`GAME-LOOP: for round ${this.rounds.nbOfRounds} the winner is ${winner.player.username}`);
	}

	resetBall(): void
	{
		this.ball.speed = this.INFO.BALL_START_SPEED;
		this.ball.posistion.x = 0.0;
		this.ball.posistion.z = 0.0;
		this.ball.direction.z = 0.0;
		if (Math.floor(Math.random() * 2) === 1)
			this.ball.direction.x = 1;
		else
			this.ball.direction.x = -1;
	}

	resetPaddles(): void
	{
		this.leftPadd.pos.z = 0.0;
		this.rightPadd.pos.z = 0.0;
		if (this.state !== State.end)
		{
			this.leftPadd.score = 0;
			this.rightPadd.score = 0;
		}
	}

	composeGameState(): JSONGameState
	{
		const gameStateInfo: JSONGameState = {
			roomId: this.roomId,
			state: this.state as number,
			timestamp: this.timestamp,
			round: this.rounds.nbOfRounds,
			leftPadd: {
				username: this.leftPadd.player?.username ?? 'NaN',
				pos: this.leftPadd.pos.z,
				score: this.leftPadd.score,
				color: this.leftPadd.player?.color
			},
			rightPadd: {
				username: this.rightPadd.player?.username ?? 'NaN',
				pos: this.rightPadd.pos.z,
				score: this.rightPadd.score,
				color: this.rightPadd.player?.color
			},
			ball: { x: this.ball.posistion.x, z: this.ball.posistion.z },
		};

		if (this.state === State.end && this.rounds.results)
		{
			const finalMatch: IResult = this.rounds.results[this.rounds.results.length - 1];
			gameStateInfo.results = {
				winner: finalMatch.winner.username,
				loser: finalMatch.loser.username
			};
		}

		return gameStateInfo;
	}
}
