export { State, IPlayer, IRound, Level, IOptions }

enum State {
	opening, launch, play, pause, end
};

interface IPlayer {
	id: number;
	name: string;
	score: number;
};
//	Add custom options of the player later!!!???

interface IRound {
	winnerId: number;
	maxScore: number;
	loserId: number;
	minScore: number;
};

enum Level {
	easy, medium, hard
};

interface IOptions {
	level: Level;
	nbOfPlayer: number;
	ballColor: string;
	paddColor: string;
	mapColor: string;
	players: string[];
};
