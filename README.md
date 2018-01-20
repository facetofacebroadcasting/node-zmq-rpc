# node-zmq-rpc
Rpc client built on persistent zmq connections.

## Getting Started
```shell
npm install --save node-zmq-rpc
```

```javascript
const { Client, Server } = require('node-zmq-rpc');

const server = Server({
	getUser(req) {
		const { name } = req.body;
		// Do something to get user...
		const user = getUser(name);
		req.reply(200, user);
	},
});
server.bind(`tcp://0.0.0.0:3000`);


const client = Client({ heartbeatPeriod: 500, health: 3 });
client.connect(`tcp://127.0.0.1:3000`);

client.on('close', () => {
	console.log('Client closed');
});

client.call('getUser', { name: 'Dan' })
	.then((resp) => {
		console.log(resp.statusCode, resp.body);
	})
	.catch((err) => {
		console.error(err.statusCode, err.body);
	});


// Later on...
setTimeout(() => client.close(), 1000);
```
