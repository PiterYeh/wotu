export default class Client {
	constructor(roomName) {
		this.q = [];
		this.isOpen = false;
		this.ws = new WebSocket(`${(location.protocol == 'https:' ? 'wss' : 'ws')}://${location.hostname}:${location.port}/listen?room=${roomName}`);
		this.onMessage = null;
		this.ws.onopen = () => {
			this.isOpen = true;
			for(let msg of this.q)
				this.ws.send(msg);
			this.q.length = 0;
		};
		let self = this;
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