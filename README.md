# zmq-rpc
Rpc client built on persistent zmq connections.

## Getting Started
```shell
npm install --save zmq-rpc
```

```javascript
const { Client, Server } = require('zmq-rpc');

const server = Server({
	addStreamKey(req) {
		const { key } = req.body;
		req.reply(200);
	},
});
server.bind(`tcp://0.0.0.0:${port}`);


const client = Client({ heartbeatPeriod: 2000, health: 3, persist: true });
client.connect(`tcp://${address}:${port}`);

client.on('close', () => {

});

client.send('addStreamKey', args);

client.call('addStreamKey', args)
	.then((resp) => {

	})
	.catch((err) => {

	});

client.close();
```
