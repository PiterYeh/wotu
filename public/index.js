import Finger from './Finger.js';
import Client from './Client.js';
import User from './User.js';

let fingers = [];
let users = [];
const isTouch = navigator.maxTouchPoints > 0;
let client = new Client(getRoomName());
client.onMessage = updateUser;

let main = document.getElementsByTagName('main')[0];

if(isTouch)
	setupTouchEvents(main, fingers);
else
	setupMouseEvents(main, fingers);

function setupMouseEvents(main, fingers) {
	main.addEventListener('mousedown', function(e) {
		let finger = new Finger(e.clientX, e.clientY, main, 'mouse', null, false);
		fingers.push(finger);
		notifyWs();
	});
	main.addEventListener('mouseup', function(e) {
		for(let finger of fingers) {
			finger.kill(fingers);
			notifyWs();
		}
	});
	main.addEventListener('mousemove', function(e) {
		for(let finger of fingers) {
			finger.move(e.clientX, e.clientY);
			notifyWs();
		}
	});
}

function setupTouchEvents() {
	main.addEventListener('touchstart', updateTouches);
	main.addEventListener('touchend', updateTouches);
	main.addEventListener('touchmove', updateTouches);
}

function updateTouches(e) {
	for(let finger of fingers)
		finger.alive = false;
	for(let touch of e.touches) {
		let finger = fingers.find(x => x.id == touch.identifier);
		if(finger == null) {
			let finger = new Finger(touch.clientX, touch.clientY, main, touch.identifier, null, false);
			fingers.push(finger);
			notifyWs();
		}
		else {
			finger.alive = true;
			finger.move(touch.clientX, touch.clientY);
			notifyWs();
		}
	}
	for(let finger of fingers)
		if(!finger.alive) {
			finger.kill(fingers);
			notifyWs();
		}
	e.preventDefault();
	return false;
}

function dbg(txt) {
	let p = document.createElement('p');
	p.innerText = [...arguments].join(', ');
	let el = document.getElementById('dbg');
	el.innerHTML = '';
	el.appendChild(p);;
}

function getRoomName() {
	let tokens = location.href.split('/');
	return tokens[tokens.length - 1];
}

function notifyWs() {
	client.send({
		fingers: fingers
			.filter(x => !x.killed)
			.map(finger => ({
				id: finger.id,
				x: finger.x / document.body.clientWidth,
				y: finger.y / document.body.clientHeight,
				color: finger.color
			}))
	})
}

function updateUser(msgJSON) {
	let msg = JSON.parse(msgJSON);
	let user = users.find(x => x.id == msg.userId);
	if(user == null) {
		user = new User(msg.userId);
		users.push(user);
	}
	user.updateFingers(main, msg.fingers);
}