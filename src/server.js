import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as express from 'express';
import { Player, Game } from './models';

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({
	server: server,
});

const games = new Map();

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

wss.on('connection', (socket) => {
	socket.on('message', (data) => {
		let message = JSON.parse(data);

		if (message.type == 'createGame') {
			if (!games.get(message.body.code)) {
				// Проверка на то, создана ли игра с таким кодом
				games.set(
					message.body.code,
					new Game(message.body.code, new Player(socket, message.body.name))
				);
				console.log(
					`Челик ${message.body.name} создал игру с кодом ${message.body.code}!`
				);
			} else {
				let data = {
					type: 'error',
					body: 'Игра с таким кодом уже существует!',
				};

				socket.send(JSON.stringify(data));
			}
		} else if (message.type == 'joinGame') {
			let game = games.get(message.body.code);
			if (!game) {
				// Проверка существует ли игра с таким кодом
				let data = {
					type: 'error',
					body: 'Игры с таким кодом не существует!',
				};

				socket.send(JSON.stringify(data));
			} else {
				game.addPlayer(socket, message.body.name);
				console.log(
					`Челик ${message.body.name} вошёл в игру с кодом ${message.body.code}!`
				);
			}
		} else if (message.type == 'startGame') {
			let game = games.get(message.body.code);
			if (!game) {
				// Проверка существует ли игра с таким кодом
				let data = {
					type: 'error',
					body: 'Игру, который вы пытаетесь запустить не существует!',
				};

				socket.send(JSON.stringify(data));
			} else {
				if (game.host.socket == socket) {
					// Проверка является ли человек хостом
					game.start();
				} else {
					let data = {
						type: 'error',
						body: 'Вы не являетесь хостом этой игры!',
					};

					socket.send(JSON.stringify(data));
				}
			}
		}
	});
});

server.listen('3000', () => {
	console.log('Server is listening at port 3000');
});
