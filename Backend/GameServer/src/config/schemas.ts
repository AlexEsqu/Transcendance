/************************************************************************************************************/

export { waitingSchema, gameSchema, 
	JSONGameState, JSONInputsUpdate, JSONRoomAccess, JSONMatchesResults, JSONRoomDemand
}

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema = {
	type: 'object',
	required: ['id', 'match', 'location'],
	properties: {
		id: {type: 'number'},
		username: {type: 'string'},
		match: {type: 'string'},
		location: {type: 'string'}
	},
	additionalProperties: false
};

const gameSchema = {
	type: 'object',
	required: ['username', 'roomId', 'ready'],
	properties: {
		username: {type: 'string'},
		roomId: {type: 'number'},
		ready: {type: 'boolean'},
		state: {type: 'number'},
		move: {type: 'string'}
	},
	additionalProperties: false
};

/************************************************************************************************************
 * 		Declare submit JSON forms to communicate with clients or server									*
 ***********************************************************************************************************/

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

interface JSONRoomAccess {
	roomId: number;
	message: string;
	players: string[];
};

interface JSONRoomDemand {
	id: number;
	username: string;
	match: string;
	location: string;
};

interface JSONMatchesResults {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
};
