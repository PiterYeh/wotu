export default class Client {
	constructor(roomName) {
		this.q = [];
		this.isOpen = false;
		this.ws = null;
		this.onMessage = null;
		this.connect(roomName);
	}

	connect(roomName) {
		let self = this;
		this.ws = new WebSocket(`${(location.protocol == 'https:' ? 'wss' : 'ws')}://${location.hostname}:${location.port}/${roomName}`);
		this.ws.onopen = () => {
			this.isOpen = true;
			for(let msg of this.q)
				this.ws.send(msg);
			this.q.length = 0;
		};
		this.ws.onclose = function() {
			this.isOpen = false;
			setTimeout(() => self.connect(roomName), 1000);
		};
		this.ws.onmessage = function(msg) {
			if(typeof self.onMessage !== 'function')
				throw new Error('no cb found');
			self.onMessage(msg.data);
		};
	}

	send(msg) {
		let json = JSON.stringify(msg);
		if(this.isOpen)
			this.ws.send(json);
		else
			this.q.push(json);
	}
}