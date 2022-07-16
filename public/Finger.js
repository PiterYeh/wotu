export default class Finger {
	constructor(x, y, parent, id) {
		this.x = 0;
		this.y = 0;
		this.alive = true;
		this.killed = false;
		this.element = null;
		this.radius = 50;
		this.id = id;
		this.color = `hsla(${Math.random() * 360}, 50%, 50%, 1)`;

		this.init(x, y, parent);
	}

	move(x, y) {
		this.x = x;
		this.y = y;
		if(this.element != null) {
			this.element.style.left = (this.x - this.radius/2) + 'px';
			this.element.style.top = (this.y - this.radius/2) + 'px';
			return true;
		}
		return false;
	}

	distance(x, y) {
		let dx = x - this.x;
		let dy = y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	init(x, y, parent) {
		this.element = document.createElement('div');
		this.element.classList.add('finger');
		this.element.style.width = this.radius + 'px';
		this.element.style.height = this.radius + 'px';
		this.element.style.backgroundColor = this.color;
		parent.appendChild(this.element);
		this.move(x, y);
	}

	kill(fingers) {
		if(this.killed)
			return;
		this.killed = true;
		this.element.classList.add('ded');
		setTimeout(x => {
			this.element.parentElement.removeChild(this.element);
			let idx = fingers.indexOf(this);
			if(idx != -1)
				fingers.splice(idx, 1);
		}, 250);
	}
}