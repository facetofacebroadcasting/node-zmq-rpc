// const { test } = require('tape');
// const { Client, Server } = require('../src');


// test('Rpc', (t1) => {
// 	t1.test('request reply cycle', (t) => {
// 		const server = Server({
// 			createUser(req) {
// 				req.reply({ name: 'Dan' });
// 			},
// 		});
// 		server.bind('tcp://0.0.0.0:3000');

// 		const client = Client();
// 		client.connect('tcp://0.0.0.0:3000');

// 		client.call('createUser')
// 			.then((resp) => {
// 				t.equal(resp.body.name, 'Dan');
// 				t.end();
// 			});
// 	});
// });
