const RoomFinger = require('./RoomFinger.js');

module.exports = class RoomUser {
	constructor(id) {
		this.id = id;
		this.fingers = [];
		this.connection = null;
	}

	setFingers(fingers) {
		this.fingers = fingers.map(x => new RoomFinger(x));
	}
}