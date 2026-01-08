import { isBallHittingWall, isBallHittingPaddle, isBallOutOfBounds, isNewPaddPosHittingMapLimit, 
	adjustBallHorizontalPos, adjustBallVerticalPos, scaleVelocity, normalizeVector, processRobotOpponent 
} from './physics';

import { GAME, IBall, IPaddle, IPlayer, State, Level, MatchType, IRound, IResult } from '../config/pongData'
import { initBall, initPadd, initPlayers } from '../utils/init'
import { notifyPlayersInRoom } from '../utils/broadcast';
import { JSONGameState } from '../config/schemas';
import { GameControl } from './GameControl';
import { Room } from './Room';
import { sendMatchesToDataBase } from '../utils/sendMatchResult';

/************************************************************************************************************/

export class GameLoop
{
	roomId: number;
	matchType: MatchType;
	ball: IBall;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	rounds: IRound;
	players: Array<IPlayer>;
	state: State;
	isGameRunning: boolean;
	timestamp: number;

	constructor(roomId: number, matchType: MatchType, players: Map<number, IPlayer>)
	{
		if (matchType === MatchType.tournament)
			GAME.MAX_ROUNDS = matchType - 1;
		this.roomId = roomId;
		this.matchType = matchType;
		this.ball = initBall();
		this.leftPadd = initPadd(matchType, 'left');
		this.rightPadd = initPadd(matchType, 'right');
		this.players = initPlayers(players);
		this.rounds = { results: null, waitingPlayers: this.players, nbOfRounds: 0 };
		this.requestNewRound();
		this.state = State.opening;
		this.isGameRunning = false;
		this.timestamp = -1;
	}

	runGameLoop(gameControl: GameControl): void
	{
		const room: Room | undefined = gameControl.getGamingRoom(this.roomId);
		if (room === undefined) return ; // HANDLE ERROR LATER

		let isNewRound: boolean = false;
		let gameStateInfo: JSONGameState;

		console.log("GAME-SERVER: game loop started");
		const interval = setInterval(() => {
			//	update data & check collisions
			if (this.state === State.play && this.isGameRunning) {
				this.updateGameData();
				//	monitor score/rounds
				isNewRound = this.isPlayerHitsMaxScore();
			}
			if (isNewRound)
				this.requestNewRound();
			isNewRound = false;
			this.timestamp = Date.now();
			//	broadcast to players = send game state/data to all players
			gameStateInfo = this.composeGameState();
			notifyPlayersInRoom(room, JSON.stringify(gameStateInfo));
		}, 1000 / 60); // 60fps

		if (this.state === State.end && this.rounds.results)
			sendMatchesToDataBase(this.rounds.results[this.rounds.results.length - 1], Date.now());
	}

	updateGameData(): void
	{
		//	Move the ball position according to its direction and velocity
		const deltaTime: number = (Date.now() - this.timestamp) / 1000;
		const velocity = scaleVelocity(this.ball, deltaTime);
		this.ball.posistion.x += velocity.x;
		this.ball.posistion.z += velocity.z;

		//	Check if the ball hits the edge of map/paddles or is out of bounds -> update its direction accordingly
		//	Depending on what/where the ball hits an object or a limit, its direction is reversed and gains speed
		const isBallOutOfBounds: boolean = this.bouncingBallProcess();
		if (isBallOutOfBounds)
			this.state = State.launch;

		if (this.leftPadd.robot)
			this.processPlayerInput(0, processRobotOpponent(this.leftPadd, this.ball));
	}

	bouncingBallProcess(): boolean
	{
		if (isBallHittingPaddle(this.ball, this.leftPadd) || isBallHittingPaddle(this.ball, this.rightPadd))
		{
			//	Invert X direction
			this.ball.posistion.x = adjustBallHorizontalPos(this.ball);
			this.ball.direction.x = -(this.ball.direction.x);
			
			const ballLeftEdge = this.ball.posistion.x - GAME.BALL_RADIUS;
			//	Avoid repeating trajectories, increase angle (Z-axis) if the ball hits top/down edge of the paddle
			if (ballLeftEdge <= 0)
				this.ball.direction.z = (this.ball.posistion.z - this.leftPadd.pos.z) / GAME.PADD_WIDTH;
			else
				this.ball.direction.z = (this.ball.posistion.z - this.rightPadd.pos.z) / GAME.PADD_WIDTH;
			//	Increase again the angle (less predictable) --- is necessary ??
			this.ball.direction.z *= 1.01;
			//	Add random noise to trajectories (avoid perfect loop, less predictable, better gameplay)
			const random = (Math.random() - 0.4) * 0.03;
			this.ball.direction.z += random;

			//	Normalize direction's vector (stabilizes physics, sightly rendering)
			this.ball.direction = normalizeVector(this.ball.direction);

			//	Increase gradually the speed
			this.ball.speed = Math.min(GAME.BALL_MAX_SPEED, this.ball.speed * 1.05);

			return false;
		}

		if (isBallHittingWall(this.ball))
		{
			this.ball.direction.z = -(this.ball.direction.z);
			this.ball.posistion.z = adjustBallVerticalPos(this.ball);
		}

		if (isBallOutOfBounds(this.ball))
		{
			if (this.ball.posistion.x > 0)
				this.leftPadd.score += 1;
			else
				this.rightPadd.score += 1;
			this.resetBall();
			return true;
		}
		return false;
	}

	processPlayerInput(playerId: number, input: string): void
	{
		let paddle: IPaddle;
	
		if (this.leftPadd.player?.id === playerId)
			paddle = this.leftPadd;
		else if (this.rightPadd.player?.id === playerId)
			paddle = this.rightPadd;
		else {
			console.error("(GAME-SERVER(processPlayerInput): no match with the given player ID");
			return ;
		}

		const deltaTime: number = (Date.now() - this.timestamp) / 1000;
		//	Frame-rate independent smoothing
        const alpha: number = 1 - Math.exp(GAME.PADD_RESPONSIVENESS * deltaTime);
		//	Calculate the velocity of the paddle's movement
		const velocityStep: number = GAME.PADD_SPEED * deltaTime * alpha;

		if (input === 'up' && !isNewPaddPosHittingMapLimit(paddle.pos.z, velocityStep, input))
			paddle.pos.z += velocityStep;
		else if (input === 'down' && !isNewPaddPosHittingMapLimit(paddle.pos.z, velocityStep, input))
			paddle.pos.z -= velocityStep;
	}

	isPlayerHitsMaxScore(): boolean
	{
		if (this.leftPadd.player === undefined || this.rightPadd.player === undefined)
			return false;

		if (this.leftPadd.score === GAME.MAX_SCORE || this.rightPadd.score === GAME.MAX_SCORE) {
			if (this.rounds.nbOfRounds >= GAME.MAX_ROUNDS)
				this.state = State.end;
			return true;
		}
		return false;
	}

	/**
	 * 	Assign new players to their paddle for the next match and reset game's data
	 */
	requestNewRound(): void
	{
		this.state = State.pause;
		this.isGameRunning = false;

		//	Save the results of the previous match, if there was one
		if (this.rounds)
			this.saveResults();

		console.log("GAME-STATE: new round");
		//	Who should play now ?
		let match = this.matchType;
		if (match === MatchType.tournament && this.rounds.nbOfRounds >= 0 && this.rounds.nbOfRounds < 2)
			match = MatchType.duo;
		//	If the match type is a tournament and it's the final round, the last two players must be the two winners of the previous rounds
		if (match === MatchType.tournament && this.rounds.nbOfRounds === GAME.MAX_ROUNDS - 1)
		{
			if (!this.rounds.results || !this.rounds.results[0] || !this.rounds.results[1]) {
				console.error("Error while trying to assign players to new round, previous match's results not found");
				return ;
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

		//	Reset game's data
		// this.ball = initBall();
		this.resetBall();
		this.resetPaddles();
	}

	/**
	 *	Save current round's results
	*/
	saveResults(): void
	{
		const winner: IPaddle = this.leftPadd.score === GAME.MAX_SCORE ? this.leftPadd : this.rightPadd;
		const loser: IPaddle = this.leftPadd.score === GAME.MAX_SCORE ? this.rightPadd : this.leftPadd;

		const results: IResult = {
			winner: winner.player,
			maxScore: winner.score,
			loser: loser.player,
			minScore: loser.score
		};

		if (this.rounds && !this.rounds.results)
			this.rounds.results = [ results ];
		else if (this.rounds)
			this.rounds.results?.push(results);
	}

	resetBall(): void
	{
		this.ball.speed = GAME.BALL_START_SPEED;
		this.ball.posistion.x = 0.0;
		if (Math.floor(Math.random() * 2) === 1)
			this.ball.direction.x = 1;
		else
			this.ball.direction.x = -1;
	}

	resetPaddles(): void
	{
		this.leftPadd.pos.z = 0.0;
		this.leftPadd.score = 0;
	}

	composeGameState(): JSONGameState
	{
		const gameStateInfo: JSONGameState = {
			roomId: this.roomId,
			state: this.state as number,
			timestamp: this.timestamp,
			round: this.rounds.nbOfRounds,
			leftPaddPos: this.leftPadd.pos.z,
			rightPaddPos: this.rightPadd.pos.z,
			leftPaddScore: this.leftPadd.score,
			rightPaddScore: this.rightPadd.score,
			ball: { x: this.ball.posistion.x, z: this.ball.posistion.z }
		};
		return gameStateInfo;
	}
}