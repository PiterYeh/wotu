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
}