import { RouteShorthandOptions } from "fastify"
import Ajv, { ValidateFunction } from 'ajv';

export { waitingSchema, gameSchema }

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema = {
	type: 'object',
	required: ['id', 'game', 'location'],
	properties: {
		id: {type: 'number'},
		game: {type: 'string'},
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
