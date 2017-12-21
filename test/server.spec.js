const Server = require('../src/server');
const { test } = require('tape');

const noop = () => {};


// Allow tests to implement select methods on the socket
const patchCreateSocket = patch => () => ({
	bindSync: noop,
	close: noop,
	send: noop,
	on: noop,
	...(patch && patch),
});


test('Server', (t1) => {
	t1.test('initializes a router socket', (t) => {
		const createSocket = (type) => {
			t.equal(type, 'router');
			t.end();
			return patchCreateSocket()();
		};
		const server = Server({ createSocket, methods: {} });
		server.close();
	});

	t1.test('rpc methods are called with a body object', (t) => {
		let msgListener;
		const createSocket = patchCreateSocket({
			on(name, callback) {
				if (name === 'message') {
					msgListener = callback;
				}
			},
		});

		const server = Server({
			createSocket,
			methods: {
				createUser(req) {
					t.deepEqual(req.body, { name: 'Dan' });
					t.end();
				},
			},
		});

		msgListener('socketId', JSON.stringify({
			command: 'createUser',
			transactionId: '123',
			body: { name: 'Dan' },
		}));
		server.close();
	});

	t1.test('methods can respond with a status code and body', (t) => {
		let msgListener;
		const createSocket = patchCreateSocket({
			on(name, callback) {
				if (name === 'message') {
					msgListener = callback;
				}
			},
			send(frames) {
				const { statusCode, body } = JSON.parse(frames[1]);
				t.equal(statusCode, 201);
				t.deepEqual(body, { userId: 'u1' });
				t.end();
			},
		});

		const server = Server({
			createSocket,
			methods: {
				createUser(req) {
					req.reply(201, { userId: 'u1' });
				},
			},
		});

		msgListener('socketId', JSON.stringify({
			command: 'createUser',
			transactionId: '123',
			body: { name: 'Dan' },
		}));
		server.close();
	});

	t1.test('responds to ping with pong', (t) => {
		let msgListener;
		const createSocket = patchCreateSocket({
			on(name, callback) {
				if (name === 'message') {
					msgListener = callback;
				}
			},
			send(frames) {
				// Should receive a pong
				t.deepEqual(frames, ['socketId', '', '2']);
				t.end();
			},
		});

		const server = Server({ createSocket, methods: {} });

		// Send ping
		msgListener('socketId', '', '1');
		server.close();
	});
});
