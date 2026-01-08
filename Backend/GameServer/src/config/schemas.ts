export { waitingSchema, gameSchema, JSONGameState, JSONInputsUpdate, JSONRoomAccess }

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema = {
	type: 'object',
	required: ['id', 'game', 'location'],
	properties: {
		id: {type: 'number'},
		match: {type: 'string'},
		location: {type: 'string'}
	},
	additionalProperties: false
};

const gameSchema = {
	type: 'object',
	required: ['id', 'roomId', 'ready'],
	properties: {
		id: {type: 'number'},
		roomId: {type: 'number'},
		ready: {type: 'boolean'},
		move: {type: 'string'}
	},
	additionalProperties: false
};

/************************************************************************************************************
 * 		Declare submit JSON forms to communicate with clients												*
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
	ball: { x: number, z: number };
};

interface JSONInputsUpdate {
	id: number;
	roomId: number;
	ready: boolean;
	move?: string;
};

interface JSONRoomAccess {
	roomId: number;
	message: string;
};