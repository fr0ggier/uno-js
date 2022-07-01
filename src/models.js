import { randomNumber } from './utils';

/*
    number - обычная карта со значением от 0 до 9.
    reverse - меняет направление
    skip - следующий игрок пропускает ход
    taketwo - следующий игрок берёт 2 карты
    choice - ты выбираешь цвет
*/

export class Player {
	constructor(socket, name) {
		this.socket = socket;

		this.name = name;

		this.cards = [];
	}

	takeCard() {
		// this.cards.push(...)
	}

	getCards() {
		let data = {
			type: 'getCards',
			body: this.cards,
		};

		this.socket.send(JSON.stringify(data));
	}

	getLastCard(card) {
		let data = {
			type: 'getLastCard',
			body: card,
		};

		this.socket.send(JSON.stringify(data));
	}

	getPlayers(players) {
		let data = {
			type: 'getPlayers',
			body: players,
		};

		this.socket.send(JSON.stringify(data));
	}
}

export class Game {
	constructor(code, firstPlayer) {
		this.code = code;

		this.players = [firstPlayer];
		this.host = firstPlayer;

		this.started = false;

		this.deck = [];
		this.lastCard = {
			color: ['red', 'yellow', 'blue', 'green'][randomNumber(0, 3)],
			type: 'choice',
		};

		// Добавление карт с цифрами
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 4; j++) {
				for (let k = 2; k > 0; k--) {
					this.deck.push({
						color: ['red', 'yellow', 'blue', 'green'][j],
						value: i,
						type: 'number',
					});
				}
			}
		}

		// Добавление уникальных карт
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 2; k > 0; k--) {
					this.deck.push({
						color: ['red', 'yellow', 'blue', 'green'][i],
						type: ['reverse', 'skip', 'taketwo'][j],
					});
				}
			}
		}

		for (let i = 0; i < 4; i++) {
			this.deck.push({
				type: 'choice',
			});
		}
	}

	addPlayer(socket, name) {
		if (!this.started) this.players.push(new Player(socket, name));
	}

	pullCard() {
		let index = randomNumber(0, this.deck.length - 1);
		let card = this.deck[index];
		delete this.deck[index];
		return card;
	}

	start() {
		for (const player of this.players) {
			for (let i = 0; i < 9; i++) {
				player.cards.push(this.pullCard());
			}
			player.getPlayers(this.players.splice(this.players.indexOf(player), 1));
			player.getCards();
			player.getLastCard(this.lastCard);
		}
	}

	putCard(player, card) {
		if (typeof card.value == 'number' && card.value == this.lastCard.value) {
			this.lastCard = card;

			let i = player.cards.indexOf(card);
			player.cards.splice(i, 1);

			return true;
		} else if (
			!card.color ||
			!this.lastCard.color ||
			this.lastCard.color == card.color
		) {
			this.lastCard = card;

			let i = player.cards.indexOf(card);
			player.cards.splice(i, 1);

			return true;
		} else return false;
	}

	cycle() {}

	end() {}
}
