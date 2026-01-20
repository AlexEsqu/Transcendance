/************************************************************************************************************/

export type { JSONInputsUpdate, JSONGameState, JSONRoomAccess, JSONRoomDemand }

/************************************************************************************************************
 * 		Declare submit JSON forms to communicate with server												*
 ***********************************************************************************************************/

interface JSONRoomDemand {
	id: number;
	username: string;
	color: string;
	matchType: string;
	location: string;
	level: number;
};

interface JSONRoomAccess {
	roomId: number;
	message: string;
	players: string[];
};

interface JSONGameState {
	roomId: number;
	state: number;
	timestamp: number;
	round: number;
	leftPadd: { username: string, pos: number, score: number, color?: string };
	rightPadd: { username: string, pos: number, score: number, color?: string };
	ball: { x: number, z: number };
	results?: { winner: string, loser: string };
};

interface JSONInputsUpdate {
	username: string;
	roomId: number;
	ready: boolean;
	state: number;
	move?: string;
};
