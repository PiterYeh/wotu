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
	console.log(`Example app listening on port ${port}`);
});
setupWebSockets(server);

function setupWebSockets(expressServer) {
	const websocketServer = new WebSocket.Server({
		noServer: true,
		path: '/listen',
	});

	expressServer.on('upgrade', (request, socket, head) => {
		console.log('upgrade request');
		websocketServer.handleUpgrade(request, socket, head, (websocket) => {
			websocketServer.emit('connection', websocket, request);
		});
	});

	websocketServer.on('connection', function connection(websocketConnection, connectionRequest) {
		let userId = readCookie(connectionRequest, 'wotuUserId');
		let roomName = connectionRequest.url.split('?')[1].split('=')[1];

		console.log('ws connected!', userId, roomName);
		websocketConnection.on('message', (message) => {
			websocketConnection.send('you said ' + message)
		});
	});
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