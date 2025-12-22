export { Ball, Paddle, Player }

import websocket from '@fastify/websocket';


interface Ball {
	x: number;
	z: number;
	speed: number;
	direction: number;
};

interface Paddle {
	z: number;
	side: number;
	robot: boolean;
};

interface Player {
	id: number;
	socket: SocketStream
	ip: 'null',
	type: 1,
	isReady: false,
	roomId: -1,
	score: 0,
	color: '#324ea8'
};

