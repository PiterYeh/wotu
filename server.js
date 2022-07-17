const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const url = require('url');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const guid = require('uuid');
const Room = require('./Room.js');

const app = express();
const port = process.env.PORT || 3000;
const isProd = true;
const pingInterval = isProd ? 30 : 3;

let vocabulary = null;
let roomsByName = {};
loadVocabulary();

app.use(cookieParser());
app.use('/public', express.static('public'));
app.use('/:room', function(req, res) {
	if(req.cookies.wotuUserId == null)
		res.cookie('wotuUserId', guid.v4());
	res.sendFile(path.join(__dirname, './public/index.html'));
});
app.use('/', function(req, res) {
	let newUrl = url.format({
		pathname: '/' + pickRoomName()
	});
	res.redirect(newUrl);
});

let server = app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
setupWebSockets(server);

function setupWebSockets(expressServer) {
	// build server
	const websocketServer = new WebSocket.Server({
		noServer: true,
	});

	// handle upgrade requests
	expressServer.on('upgrade', (request, socket, head) => {
		websocketServer.handleUpgrade(request, socket, head, (websocket) => {
			websocketServer.emit('connection', websocket, request);
		});
	});

	// manage client
	websocketServer.on('connection', function connection(ws, connectionRequest) {
		ws.isAlive = true;
		ws.on('pong', () => ws.isAlive = true);
		let userId = readCookie(connectionRequest, 'wotuUserId');
		let roomName = connectionRequest.url;
		let room = getRoom(roomName);
		let user = room.getUser(userId);
		user.connection = ws;

		// update the internal state and broadcast the user's fingers to all other users
		ws.on('message', function (messageJSON) {
			let message = JSON.parse(messageJSON);
			user.setFingers(message.fingers);
			room.broadcast(user);
		});
	});

	// periodically check if clients are still alive
	setInterval(function () {
		for(let roomName in roomsByName) {
			let room = roomsByName[roomName];
			for(let user of room.users) {
				let ws = user.connection;
				if (ws.isAlive === false) {
					if(!isProd)
						console.log('killing user', user.id, ' in room', roomName, 'leaving', room.users.length - 1, 'users left');
					ws.terminate();
					user.setFingers([]);
					room.broadcast(user);
					room.removeUser(user.id);
				}
				else {
					ws.isAlive = false;
					ws.ping();
				}
			}
		}

		// destroy empty rooms
		let roomsToKill = [];
		for(let roomName in roomsByName) {
			let room = roomsByName[roomName];
			if(room.users.length == 0)
				roomsToKill.push(roomName);
		}
		for(let roomName of roomsToKill) {
			if(!isProd)
				console.log('killing room', roomName);
			delete roomsByName[roomName];
		}
	}, pingInterval * 1000);

	if(!isProd)
		setInterval(function() {
			console.log('rooms active', Object.keys(roomsByName).length, Object.keys(roomsByName));
		}, 1 * 1000);

	return websocketServer;
}

function readCookie(req, cookieName) {
	let cookiesString = req.headers.cookie;
	if(cookiesString == null)
		return null;
	let cookies = cookiesString.split(';');
	for(let cookie of cookies) {
		let tokens = cookie.trim().split('=');
		if(tokens.length == 2 && tokens[0] == cookieName)
			return tokens[1];
	}
	return null;
}

function pickRoomName() {
	if(vocabulary == null)
		return 'idk' + (Math.random() * 999999 | 0);
	let tokens = [];
	for(let i = 0; i < 3; ++i) {
		let idx = Math.floor(Math.random() * vocabulary.length);
		tokens.push(vocabulary[idx]);
	}
	return tokens.join('-');
}

function loadVocabulary() {
	fs.readFile('english.txt', { encoding: 'utf-8' }, function(err, data) {
		if(err) {
			console.error('could not load vocabulary', err);
			vocabulary = [];
			for(let i = 0; i < 10000; ++i)
				vocabulary.push('id' + i);
		}
		else
			vocabulary = data.split('\n').map(x => x.trim());
	});
}

function getRoom(name) {
	let room = roomsByName[name];
	if(room == null) {
		room = new Room(name);
		roomsByName[name] = room;
	}
	return room;
}