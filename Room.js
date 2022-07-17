const RoomUser = require('./RoomUser.js');

module.exports = class Room {
	constructor(name) {
		this.name = name;
		this.users = [];
	}

	getUser(id) {
		let user = this.users.find(x => x.id == id);
		if(user == null) {
			user = new RoomUser(id);
			this.users.push(user);
		}
		return user;
	}

	removeUser(id) {
		this.users = this.users.filter(x => x.id != id);
	}

	broadcast(user) {
		for(let otherUser of this.users) {
			if(otherUser.id == user.id)
				continue;
			otherUser.connection.send(JSON.stringify({
				userId: user.id,
				fingers: user.fingers
			}));
		}
	}
}