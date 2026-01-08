export type { JSONMatchesResults, JSONInputsUpdate, JSONGameState, JSONRoomAccess, JSONAwaitingAccess }

/************************************************************************************************************
 * 		Declare submit JSON forms to communicate with server												*
 ***********************************************************************************************************/

interface JSONMatchesResults {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
}

interface JSONAwaitingAccess {
	id: number;
	match: string;
	location: string;
};

interface JSONRoomAccess {
	roomId: number;
	message: string;
};

interface JSONGameState {
	roomId: number;
	state: number;
	timestamp: number;
	round: number;
	leftPaddPos: number;
	rightPaddPos: number;
	leftPaddScore: number;
	rightPaddScore: number;
	ball: { x: number, z: number };
};

interface JSONInputsUpdate {
	id?: number;
	roomId: number;
	ready: boolean;
	move?: string;
};