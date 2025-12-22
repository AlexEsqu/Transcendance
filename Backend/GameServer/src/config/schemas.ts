import { RouteShorthandOptions } from "fastify"

export { waitingSchema, gameSchema }

/************************************************************************************************************
 * 		Declare schema for route's options																	*
 ***********************************************************************************************************/

const waitingSchema: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			required: [ 'id', 'gameType', 'gameLocation'],
			properties: {
				id: 'number',
				gameType: 'string',
				gameLocation: 'string'
			},
			additionalProperties: false
		}
	}
};

const gameSchema: RouteShorthandOptions = {
	schema: {
		body: {
			type: 'object',
			required: [ 'id', 'number'],
			properties: {
				id: 'number',
				roomId: 'number',
				move: 'string'
			},
			additionalProperties: false
		}
	}
};
