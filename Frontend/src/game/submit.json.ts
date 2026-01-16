/************************************************************************************************************/

export type { JSONInputsUpdate, JSONGameState, JSONRoomAccess, JSONRoomDemand }

/************************************************************************************************************
 * 		Declare submit JSON forms to communicate with server												*
 ***********************************************************************************************************/

interface JSONRoomDemand {
	id: number;
	username: string;
	match: string;
	location: string;
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
	leftPaddPos: number;
	rightPaddPos: number;
	leftPaddScore: number;
	rightPaddScore: number;
	leftPaddUsername: string;
	rightPaddUsername: string;
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
