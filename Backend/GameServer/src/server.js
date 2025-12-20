import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const gameServer = Fastify({ logger: true });


/*****************************************************************
 * 		Declare variables										 *
 *****************************************************************/
const PORT = process.env.PORT;
const HOST = process.env.ADDRESS;

/*****************************************************************
 * 		Register plugins										 *
 *****************************************************************/

await gameServer.register(websocket);

/*****************************************************************
 * 		Declare routes											 *
 *****************************************************************/

// gameServer.get('/waitingRoom', waitingRoom);
gameServer.get('/', (request, reply) => {
	reply.send({
		message: 'Hello World'
	});
	console.log(request);
});

/*****************************************************************
 * 		Run Game Server											 *
 *****************************************************************/

const launchGameServer = async () => {
	try {
		await gameServer.listen({ port: PORT, host: HOST });
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

launchGameServer();