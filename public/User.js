import Finger from './Finger.js';

export default class User {
	constructor(id) {
		this.id = id;
		this.fingers = [];
	}

	updateFingers(parent, newFingers) {
		// add + update
		for(let newFinger of newFingers) {
			let newX = newFinger.x * document.body.clientWidth;
			let newY = newFinger.y * document.body.clientHeight;
			let oldFinger = this.fingers.find(x => x.id == newFinger.id);
			if(oldFinger != null) {
				oldFinger.move(newX, newY);
			}
			else {
				let finger = new Finger(newX, newY, parent, newFinger.id, newFinger.color, true);
				this.fingers.push(finger);
			}
		}
		// kill
		for(let i = 0; i < this.fingers.length; ++i) {
			let oldFinger = this.fingers[i];
			let newFinger = newFingers.find(x => x.id == oldFinger.id);
			if(newFinger == null) {
				if(oldFinger.kill(this.fingers))
					--i;
			}
		}
	}
}