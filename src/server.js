const PING = '1';
const PONG = '2';

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
	methods,
	// From index
	createSocket,
}) => {
	const socket = createSocket('router');


	function bind(address) {
		socket.bindSync(address);
	}


	function close() {
		try {
			socket.close();
		} catch (err) {
			// No action
		}
	}


	socket.on('message', (...args) => {
		const frames = args.map(arg => arg.toString());

		if (frames[1]) {
			// Message inteneded for the application
			const { command, transactionId, body } = parseJsonDict(frames[1]);

			if (command in methods && typeof transactionId === 'string') {
				methods[command]({
					body: ensureDict(body),
					reply(statusCode, respBody) {
						socket.send([args[0], JSON.stringify({
							transactionId,
							statusCode,
							...(respBody && { body: respBody }),
						})]);
					},
				});
			}
		} else {
			// Message for this module
			const cmd = frames[2];

			if (cmd === PING) {
				socket.send([args[0], '', PONG]);
			}
		}
	});


	return {
		bind,
		close,
		socket,
	};
};
