class Deck {
	constructor() {
		this.allCards = [
			{ value: 1, code: "AS" },
			{ value: 2, code: "2S" },
			{ value: 3, code: "3S" },
			{ value: 4, code: "4S" },
			{ value: 5, code: "5S" },
			{ value: 6, code: "6S" },
			{ value: 7, code: "7S" },
			{ value: 8, code: "8S" },
			{ value: 9, code: "9S" },
			{ value: 10, code: "0D" },
			{ value: 11, code: "JD" },
			{ value: 12, code: "QD" },
			{ value: 13, code: "KD" },
			{ value: 1, code: "AD" },
			{ value: 2, code: "2D" },
			{ value: 3, code: "3D" },
			{ value: 4, code: "4D" },
			{ value: 5, code: "5D" },
			{ value: 6, code: "6D" },
			{ value: 7, code: "7D" },
			{ value: 8, code: "8D" },
			{ value: 9, code: "9D" },
			{ value: 10, code: "0D" },
			{ value: 11, code: "JD" },
			{ value: 12, code: "QD" },
			{ value: 13, code: "KD" },
			{ value: 1, code: "AC" },
			{ value: 2, code: "2C" },
			{ value: 3, code: "3C" },
			{ value: 4, code: "4C" },
			{ value: 5, code: "5C" },
			{ value: 6, code: "6C" },
			{ value: 7, code: "7C" },
			{ value: 8, code: "8C" },
			{ value: 9, code: "9C" },
			{ value: 10, code: "0C" },
			{ value: 11, code: "JC" },
			{ value: 12, code: "QC" },
			{ value: 13, code: "KC" },
			{ value: 1, code: "AH" },
			{ value: 2, code: "2H" },
			{ value: 3, code: "3H" },
			{ value: 4, code: "4H" },
			{ value: 5, code: "5H" },
			{ value: 6, code: "6H" },
			{ value: 7, code: "7H" },
			{ value: 8, code: "8H" },
			{ value: 9, code: "9H" },
			{ value: 10, code: "0H" },
			{ value: 11, code: "JH" },
			{ value: 12, code: "QH" },
			{ value: 13, code: "KH" },
		];
		this.cards = [...this.allCards];
		this.deckId = Math.floor(Math.random() * 100000);
	}
	getCard() {
		return { cards: this.cards[Math.floor(Math.random() * this.cards.length)], remaining: this.remaining };
	}
	getAndPop(amount) {
		const cardArray = [];
		for (let i = 0; i < amount; i++) {
			const cardIndex = Math.floor(Math.random() * this.cards.length);
			cardArray.push(this.cards.splice(cardIndex, 1)[0]);
		}
		console.log(this.cards.length, this.allCards.length);
		return { cardsInDeck: this.cards, cards: cardArray, remaining: this.cards.length, deckId: this.deckId };
	}
	loadNewCards() {
		this.cards = [...this.allCards];
		console.log("NEW DECK", this.cards.length, this.allCards.length);
		return this.allCards;
	}
}

module.exports = { Deck };
