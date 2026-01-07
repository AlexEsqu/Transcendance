export { waitingSchema, gameSchema, IGameMessage, IRoomMessage }

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
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

interface IGameMessage {
	id: number;
	roomId: number;
	ready: boolean;
	move?: string;
};

interface IRoomMessage {
	roomId: number;
	message: string;
};