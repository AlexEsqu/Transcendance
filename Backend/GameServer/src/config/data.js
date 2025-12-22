export { BALL, PADDLE, PLAYER }

let BALL = {
	x: 0,
	z: 0,
	speed: 0,
	direction: 0
};

let PADDLE = {
	z: 0,
	side: 'left',
	robot: false
};

let PLAYER = {
	id: -1,
	socket: -1,
	ip: 'null',
	type: 1,
	isReady: false,
	roomId: -1,
	score: 0,
	color: '#324ea8'
};