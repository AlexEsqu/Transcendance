import { RouteShorthandOptions } from "fastify"
import Ajv, { ValidateFunction } from 'ajv';

export { waitingSchema }

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema = {
	type: 'object',
	required: ['id', 'game', 'location'],
	properties: {
		id: { type: 'number'},
		game: { type: 'string'},
		location: { type: 'string'}
	},
	additionalProperties: false
};

// const gameSchema: RouteShorthandOptions = {
// 	body: {
// 		type: 'object',
// 		required: ['id', 'number'],
// 		properties: {
// 			id: { type: 'number'},
// 			roomId: { type: 'number'},
// 			move: { type: 'string'}
// 		},
// 		additionalProperties: false
// 	}
// };
