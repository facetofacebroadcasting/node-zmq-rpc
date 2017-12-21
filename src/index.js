const zmq = require('zmq');
const Client = require('./client');
const Server = require('./server');


function createSocket(type) {
	const socket = zmq.socket(type);
	socket.setsockopt('linger', 0);
	return socket;
}

module.exports = {
	Client: opts => Client({ opts, createSocket }),
	Server: methods => Server({ methods, createSocket }),
};
