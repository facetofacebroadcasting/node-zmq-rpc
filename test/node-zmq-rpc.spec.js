// const { test } = require('tape');
// const zmq = require('zmq-stub');
// const { Client, Server } = require('../src');

// function createSocket(type) {
// 	const socket = zmq.socket(type);
// 	socket.setsockopt('linger', 0);
// 	return socket;
// }

// const lib = {
// 	Client: opts => Client({ opts, createSocket }),
// 	Server: methods => Server({ methods, createSocket }),
// };

// const now = () => Math.floor(new Date());


// test('Rpc', (t1) => {
// 	t1.test('simple request with a body', (t) => {
// 		const server = lib.Server({
// 			createUser(req) {
// 				t.deepEqual(req.body, { name: 'Dan' }, 'calls the provided method');
// 				t.end();
// 				req.reply(200);
// 			},
// 		});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const client = lib.Client();
// 		client.connect('tcp://0.0.0.0:3000');
// 		client.call('createUser', { name: 'Dan' })
// 			.then(() => {
// 				server.close();
// 				client.close();
// 			});
// 	});

// 	t1.test('simple response', (t) => {
// 		const server = lib.Server({
// 			createUser(req) {
// 				req.reply(201, { name: 'Dan' });
// 			},
// 		});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const client = lib.Client();
// 		client.connect('tcp://0.0.0.0:3000');
// 		client.call('createUser')
// 			.then((resp) => {
// 				t.equal(resp.statusCode, 201, 'contains the status code');
// 				t.equal(resp.body, { name: 'Dan' }, 'contains the body object');
// 				t.end();
// 				server.close();
// 				client.close();
// 			});
// 	});

// 	t1.test('error response', (t) => {
// 		const server = lib.Server({
// 			createUser(req) {
// 				req.reply(500, { message: 'failed' });
// 			},
// 		});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const client = lib.Client();
// 		client.connect('tcp://0.0.0.0:3000');
// 		client.call('createUser')
// 			.catch((err) => {
// 				t.equal(err.statusCode, 500, 'contains the status code');
// 				t.equal(err.body, { message: 'failed' }, 'contains the body object');
// 				t.end();
// 				server.close();
// 				client.close();
// 			});
// 	});

// 	t1.test('request times out', (t) => {
// 		const server = lib.Server({
// 			createUser(req) {
// 				setTimeout(() => {
// 					req.reply(201, { name: 'Dan' });
// 				}, 200);
// 			},
// 		});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const client = lib.Client();
// 		client.connect('tcp://0.0.0.0:3000');

// 		client.call('createUser', {}, { timeout: 100 })
// 			.catch((err) => {
// 				t.equal(err.statusCode, 0, 'with status code == 0');
// 				t.end();

// 				server.close();
// 				client.close();
// 			});
// 	});

// 	t1.test('unconnected client', (t) => {
// 		const server = lib.Server({});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const start = now();
// 		const client = lib.Client({ heartbeatPeriod: 100, health: 3 });
// 		client.connect('tcp://0.0.0.0:1111'); // NOTE: port != 3000
// 		client.on('close', () => {
// 			t.ok(now() - start < 1000, 'closes after health expires');
// 			server.close();
// 			client.close();
// 		});
// 	});
// });
