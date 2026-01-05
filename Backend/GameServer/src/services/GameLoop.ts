import { IBall, IPaddle, IPlayer, State, Level, GameType, IRound, IResult, IGameState } from '../config/gameData'
import { initBall, initPadd, initPlayers } from '../utils/init'
import { isNewPaddPosHittingMapLimit, scaleVelocity } from './physics';
import { notifyPlayersInRoom } from '../utils/broadcast';
import { GameControl } from './GameControl';
import { Room } from './Room';

export class GameLoop
{
	static MAX_SCORE = 2;
	static MAX_ROUNDS = 1;

	static BALL_START_SPEED = 6;
	static BALL_MAX_SPEED = 10;
	static BALL_RADIUS = 0.15;

	static PADD_RESPONSIVENESS = -25.0;
	static PADD_SPEED = 25.0;

	roomId: number;
	matchType: GameType;
	ball: IBall;
	leftPadd: IPaddle;
	rightPadd: IPaddle;
	rounds: IRound;
	players: Array<IPlayer>;
	state: State;
	isGameRunning: boolean;
	timestamp: number;

	constructor(roomId: number, matchType: GameType, players: Map<number, IPlayer>)
	{
		if (matchType === GameType.tournament)
			GameLoop.MAX_ROUNDS = matchType - 1;
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
		let gameStateInfo: IGameState;

		const interval = setInterval(() => {
			//	update data & check collisions
			if (this.state === State.play && this.isGameRunning) {
				this.updateGameData();
				//	monitor score/rounds
				isNewRound = this.monitorScore();
			}
			if (isNewRound)
				this.requestNewRound();
			isNewRound = false;
			this.timestamp = Date.now();
			//	broadcast to players = send game state/data to all players
			gameStateInfo = this.composeGameState();
			notifyPlayersInRoom(room, JSON.stringify(gameStateInfo));
		}, 1000 / 60); // 60fps
	}

	updateGameData(): void
	{
		//	Move the ball position according to its direction and velocity
		const deltaTime: number = (Date.now() - this.timestamp) / 1000;
		const velocity = scaleVelocity(this.ball, deltaTime);
		this.ball.posX += velocity.x;
		this.ball.posZ += velocity.z;

		//	Check if the ball hits the edge of map/paddles or is out of bounds -> update its direction accordingly
		//	Depending on what/where the ball hits an object or a limit, its direction is reversed and gain speed
		const isBallOutOfBounds: boolean = bouncingBallProcess();
		if (isBallOutOfBounds)
			this.state = State.launch;
		
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
        const alpha: number = 1 - Math.exp(GameLoop.PADD_RESPONSIVENESS * deltaTime);
		//	Calculate the velocity of the paddle's movement
		const velocityStep: number = GameLoop.PADD_SPEED * deltaTime * alpha;

		if (input === 'up' && !isNewPaddPosHittingMapLimit(paddle.posZ, velocityStep, input))
			paddle.posZ += velocityStep;
		else if (input === 'down' && !isNewPaddPosHittingMapLimit(paddle.posZ, velocityStep, input))
			paddle.posZ -= velocityStep;
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
		let nbOfPlayers = this.matchType as number;
		if (nbOfPlayers === 4 && this.rounds && this.rounds.nbOfRounds >= 0 && this.rounds.nbOfRounds < 2)
			nbOfPlayers = 2;
		//	If the match type is a tournament and it's the final round, the last two players must be the two winners of the previous rounds
		if (nbOfPlayers == 4 && this.rounds && this.rounds.results && this.rounds.nbOfRounds == GameLoop.MAX_ROUNDS - 1)
		{
			if (this.rounds.results[0])
				this.leftPadd.player = this.rounds.results[0].winner;
			if (this.rounds.results[1])
				this.rightPadd.player = this.rounds.results[1].winner;
		}
		else if (this.rounds.waitingPlayers) 
		{
			this.leftPadd.player = this.rounds.waitingPlayers.pop();
			this.rightPadd.player = this.rounds.waitingPlayers.pop();
		}
		this.rounds.nbOfRounds += 1;

		//	Reset data
		this.ball = initBall();
		// this.resetBall();
		this.resetPaddles();
	}

	/**
	 *	Save current round's results
	*/
	saveResults(): void
	{
		const winner: IPaddle = this.leftPadd.score === GameLoop.MAX_SCORE ? this.leftPadd : this.rightPadd;
		const loser: IPaddle = this.leftPadd.score === GameLoop.MAX_SCORE ? this.rightPadd : this.leftPadd;

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
		this.ball.speed = GameLoop.BALL_START_SPEED;
		this.ball.posX = 0.0;
	}

	resetPaddles(): void
	{
		this.leftPadd.posZ = 0.0;
		this.leftPadd.score = 0;
	}

	composeGameState(): IGameState
	{
		const gameStateInfo: IGameState = {
			roomId: this.roomId,
			state: this.state as number,
			timestamp: this.timestamp,
			round: this.rounds.nbOfRounds,
			leftPaddPos: this.leftPadd.posZ,
			rightPaddPos: this.rightPadd.posZ,
			ball: { x: this.ball.posX, z: this.ball.posZ }
		};
		return gameStateInfo;
	}
}