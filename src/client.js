const PING = '1';
const DEFAULT_HEARTBEAT = 5000;
const DEFAULT_HEALTH = 3;
const DEFAULT_TIMEOUT = 5000;


function randomAlphanumeric(len) {
	const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const setLength = charSet.length;
	let str = '';
	for (let i = 0; i < len; i += 1) {
		str += charSet.charAt(Math.floor(Math.random() * setLength));
	}
	return str;
}

function positiveIntOrDefault(val, def) {
	return Number.isInteger(val) && val >= 0 ? val : def;
}

function ensureDict(dict) {
	return dict instanceof Object ? dict : {};
}

function parseJsonDict(json) {
	try {
		const dict = JSON.parse(json);
		return ensureDict(dict);
	} catch (err) {
		return {};
	}
}


module.exports = ({
	// From parent
	options,
	// From index
	createSocket,
}) => {
	const heartbeatPeriod = (options && options.heartbeatPeriod) || DEFAULT_HEARTBEAT;
	const totalHealth = (options && options.health) || DEFAULT_HEALTH;
	let health = totalHealth;
	let receivedHeartbeat = true;
	let pulse;
	const transactions = {};
	const connections = [];

	const events = {
		close: [],
	};

	const emit = (name, ...args) => events[name].forEach(f => f(...args));
	const socket = createSocket('dealer');


	function connect(address) {
		if (!(address in connections)) {
			connections.push(address);
			socket.connect(address);
		}
	}


	function on(eventName, listener) {
		if (eventName in events && typeof listener === 'function') {
			events[eventName].push(listener);
		}
	}


	function ping() {
		socket.send(['', PING]);
	}


	function call(command, body, opts) {
		const tId = randomAlphanumeric(12);
		const timeout = positiveIntOrDefault(opts && opts.timeout, DEFAULT_TIMEOUT);

		const deleteTrans = () => {
			if (tId in transactions) {
				clearTimeout(transactions[tId].timeout);
				delete transactions[tId];
			}
		};

		return new Promise((resolve, reject) => {
			transactions[tId] = {
				callback(statusCode, respBody) {
					deleteTrans();
					if (statusCode < 400) {
						resolve({ statusCode, body: respBody });
					} else {
						reject({ statusCode, body: respBody });
					}
				},
				timeout: setTimeout(() => {
					deleteTrans();
					reject({ statusCode: 0, body: {} });
				}, timeout),
			};

			socket.send(JSON.stringify({
				command,
				body,
				transactionId: tId,
			}));
		});
	}


	function close() {
		try {
			socket.close();
		} catch (err) {
			// No action required
		}

		clearInterval(pulse);
		emit('close');
	}


	// Continually ping the client to ensure the connection is still alive.
	// There are cases such as when a client pulls the cord where we will not
	// automatically detect the socket disconnect
	function checkPulse() {
		if (receivedHeartbeat) {
			health = totalHealth;
		} else {
			health -= 1;
		}

		if (health <= 0) {
			// Client not responding. Close the socket.
			close();
		} else {
			// Client is responding. Send another ping and wait.
			receivedHeartbeat = false;
			ping();
		}
	}

	pulse = setInterval(checkPulse, heartbeatPeriod);


	socket.on('message', (...args) => {
		receivedHeartbeat = true;
		const frames = args.map(arg => arg.toString());

		if (frames[0]) {
			const { transactionId, statusCode, body } = parseJsonDict(frames[0]);

			if (transactionId && transactionId in transactions) {
				transactions[transactionId].callback(
					positiveIntOrDefault(statusCode, 200),
					ensureDict(body),
				);
			}
		}
	});


	return {
		on,
		connect,
		call,
		close,
		socket,
		getConnections: () => connections,
	};
};
