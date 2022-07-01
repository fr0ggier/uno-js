const socket = new WebSocket('ws://localhost:3000');

function sendData(data) {
	if (!socket.readyState) {
		setTimeout(() => {
			sendData(data);
		}, 100);
	} else {
		socket.send(JSON.stringify(data));
	}
}

let player;

document.querySelector('#submitName').addEventListener('click', (e) => {
	const playerName = document.getElementById('playerName');

	if (player) return alert('Вы уже указали имя!');
	player = new Player(socket, playerName.value);
});

document.querySelector('#createGame').addEventListener('click', (e) => {
	player.game.code = document.getElementById('gameCode').value;

	if (!player) return alert('Вы не указали имя!');
	if (!player.game.code) return alert('Вы не указали код!');

	player.createGame(player.game.code, player.name);
});

document.querySelector('#joinGame').addEventListener('click', (e) => {
	player.game.code = document.getElementById('gameCode').value;

	if (!player) return alert('Вы не указали имя!');
	if (!player.game.code) return alert('Вы не указали код!');

	player.joinGame(player.game.code, player.name);
});

class Player {
	constructor(socket, name) {
		this.socket = socket;

		this.name = name;
		this.cards = [];

		this.game = {
			code: undefined,
			players: [],
			lastCard: {},
		};
	}

	createGame(code, name) {
		let requestData = {
			type: 'createGame',
			body: {
				name: name,
				code: code,
			},
		};

		sendData(requestData);
	}

	joinGame(code, name) {
		let requestData = {
			type: 'joinGame',
			body: {
				name: name,
				code: code,
			},
		};

		sendData(requestData);
	}

	startGame() {
		if (!this.name || !this.game.code) return;

		let requestData = {
			type: 'createGame',
			body: {
				name: this.name,
				code: this.game.code,
			},
		};

		sendData(requestData);
	}
}

socket.onopen = () => {
	console.log('Connected to server successfully');
};

socket.onclose = (event) => {
	console.log(`Отключение с кодом: ${event.code}\nПричина:${event.reason}`);
};

socket.onerror = (err) => {
	console.log(`Ошибка: ${err}`);
};

const handleMessage = {
	event: {
		getCards: getCards,
		getLastCard: getLastCard,
		getPlayers: getPlayers,
	},
	request: {},
	response: {},
	defaut: unknownHandler,
};

socket.onmessage = (message) => {
	const res = JSON.parse(message.data);

	handleMessage[res.type].hasOwnProperty(res.name)
		? handleMessage[res.type][res.name](res)
		: handleMessage.default();
};

/* Events */
function getCards() {}
function getLastCard() {}
function getPlayers() {}

/* Request/Response */

/* Default */
function unknownHandler() {

}
