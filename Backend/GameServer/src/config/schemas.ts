/************************************************************************************************************/

export { waitingSchema, gameSchema, 
	JSONGameState, JSONInputsUpdate, JSONRoomAccess, JSONMatchesResults, JSONRoomDemand
}

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema = {
	type: 'object',
	required: ['id', 'username', 'matchType', 'location'],
	properties: {
		id: {type: 'number'},
		username: {type: 'string'},
		color: {type: 'string'},
		matchType: {type: 'string'},
		location: {type: 'string'},
		level: {type: 'number'}
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
 * 		Declare submit JSON forms to communicate with clients or server										*
 ***********************************************************************************************************/

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

interface JSONRoomAccess {
	roomId: number;
	message: string;
	players: string[];
};

interface JSONRoomDemand {
	id: number;
	username: string;
	color: string;
	matchType: string;
	location: string;
	level: number;
};

interface JSONMatchesResults {
	winner_id: number;
	loser_id: number;
	winner_score: number;
	loser_score: number;
	date: string;
};
