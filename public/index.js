import Finger from './Finger.js';

let fingers = [];
let fingerRadius = 50;
const isTouch = navigator.maxTouchPoints > 0;

let main = document.getElementsByTagName('main')[0];

if(isTouch)
	setupTouchEvents(main, fingers);
else
	setupMouseEvents(main, fingers);

function findFinger(x, y) {
	return fingers.find(f => f.distance(x, y) < fingerRadius);
}

function setupMouseEvents(main, fingers) {
	// click
	main.addEventListener('click', function(e) {
		if(fingers.length == 0)
			fingers.push(new Finger(e.clientX, e.clientY, main));
		else
			fingers[0].kill(fingers);
	});

	// move
	main.addEventListener('mousemove', function(e) {
		if(fingers.length > 0)
			fingers[0].move(e.clientX, e.clientY);
	});

	// esc
	document.body.addEventListener('keydown', function(e) {
		if(e.key == 'Escape') {
			for(let finger of fingers)
				finger.kill(fingers);
		}
	});
}

function setupTouchEvents() {
	main.addEventListener('touchstart', updateTouches);
	main.addEventListener('touchend', updateTouches);
	main.addEventListener('touchmove', updateTouches);
}
let kk=0;
function updateTouches(e) {
	console.log(e)
	for(let finger of fingers)
		finger.alive = false;
	for(let touch of e.touches) {
		let finger = fingers.find(x => x.id == touch.identifier);
		if(finger == null)
			fingers.push(new Finger(touch.clientX, touch.clientY, main, touch.identifier));
		else {
			finger.alive = true;
			finger.move(touch.clientX, touch.clientY);
		}
	}
	for(let finger of fingers)
		if(!finger.alive)
			finger.kill(fingers);
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