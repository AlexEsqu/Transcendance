import Fastify from 'fastify';
import websocket from '@fastify/websocket';

'use scrict'

/*****************************************************************
 * 		Declare variables										 *
 *****************************************************************/
const PORT = process.env.PORT;
const HOST = process.env.ADDRESS;

const gameServer = Fastify({ logger: true });

/*****************************************************************
 * 		Register plugins/external routes						 *
 *****************************************************************/

//	Adds WebSocket support for the Fastify RESTful router
// gameServer.register(websocket, { options });
// gameServer.register(websocket, { 
// 	options: {
// 		port: PORT
// 	}
// });
// await gameServer.register(websocket);

/*****************************************************************
 * 		Declare routes/endpoints											 *
 *****************************************************************/
// ROUTE DECLARATION : fastify.get(path, [options], handler)

gameServer.get('/', (request, reply) => {
	//	Returns a JSON payload to the client
	reply.send({
		message: 'Hello World'
	});
});

// gameServer.register(async function (gameServer) {
// 	gameServer.get('/game', { websocket: true }, (connection, req) => {
// 		connection.socket.on('message', message => {
// 			connection.socket.send('You are connected');
// 		});
// 	});
// });

/*****************************************************************
 * 		Run Game Server											 *
 *****************************************************************/

const launchGameServer = async () => {
	try {
		await gameServer.register(websocket);

		gameServer.register(async function (gameServer) {
			gameServer.get('/game', { websocket: true }, (connection, req) => {
				connection.socket.on('message', message => {
					connection.socket.send('You are connected');
					console.log("new client connected");
				});
			});
		});


		await gameServer.listen({ port: PORT, host: HOST }, (address) => {
			console.log("GAME-SERVER: listening");
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

launchGameServer();