const Client = require('../src/client');
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


test('Client', (t1) => {
	t1.test('initializes a dealer socket', (t) => {
		const createSocket = (type) => {
			t.equal(type, 'dealer');
			t.end();
			return patchCreateSocket()();
		};
		const client = Client({ createSocket });
		client.close();
	});
});
