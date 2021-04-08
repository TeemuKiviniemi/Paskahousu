import { useState, useEffect } from "react";
import Player from "./components/Player";
import GameInfo from "./components/GameInfo";
import JoinToGame from "./components/JoinToGame";
import Log from "./components/Log";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { checkValidMove } from "./utils/utils";
import axios from "axios";

const socket = io("http://localhost:4000");

function App() {
	const [deckId, setDeckId] = useState("2r1mqhamqo49");
	const [deck, setDeck] = useState([]);
	const [remaining, setRemaining] = useState(52);
	const [latestCard, setLatestCard] = useState({
		image: "https://deckofcardsapi.com/static/img/X2.png",
		value: 0,
		code: 0,
	});
	const [username, setUsername] = useState();
	const [gameInfo, setGameInfo] = useState([]);
	const [stack, setStack] = useState([]);
	const [turn, setTurn] = useState(false);
	const [selectedCards, setSelectedCards] = useState([]);
	const [log, setLog] = useState([]);

	// Open connection to server to get data
	useEffect(() => {
		// send info about latest cards that has been played
		socket.on("latest", (card) => {
			setLatestCard(card);
		});

		// get num of remaining cards in pack
		socket.on("remaining", (responce) => {
			setRemaining(responce);
		});

		// get players from servers
		socket.on("players", (player) => {
			setGameInfo(player);
		});

		// get stack of cards that have been played
		socket.on("stack", (cards) => {
			setStack(cards);
		});

		socket.on("turn", (turn) => {
			setTurn(turn);
		});

		// If start is true -> loads new deck when joining to game.
		// If false -> only loads cards to self when joining
		socket.on("onStart", async (start) => {
			if (start === true) {
				suffleDeck();
				const newCards = await fetchCard(3);
				setDeck(newCards);
			} else {
				const newCards = await fetchCard(3);
				setDeck(newCards);
			}
		});

		// Get events from the server
		socket.on("log", (item) => {
			setLog(item);
		});
	}, []);

	const joinGame = () => {
		socket.emit("join_game", username);
	};

	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
	};

	// load new deck at the start of the game
	const suffleDeck = async () => {
		await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
	};

	// Raise cards from stack to players deck
	const raiseCardStack = () => {
		socket.emit("cards", deck.length + stack.length);
		setDeck([...deck, ...stack]);
		setLatestCard({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
		socket.emit("stack", "empty");
		socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
		changeTurn();
	};

	const changeTurn = () => {
		socket.emit("turn", true);
	};

	const drawRandomCard = async () => {
		const newCard = await fetchCard(1);
		console.log(newCard);
		setDeck([...deck, newCard[0]]);
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (selectedCards.length > 0) {
			if (selectedCards.indexOf(deck[num]) !== -1) {
				const cards = selectedCards.filter((item) => item !== deck[num]);
				setSelectedCards(cards);
			} else if (selectedCards[selectedCards.length - 1].value === deck[num].value) {
				const cards = [...selectedCards, deck[num]];
				setSelectedCards(cards);
			} else {
				setSelectedCards([]);
				alert("Et voi valita eri kortteja pelattavaksi samalla siirrolla");
			}
		} else {
			setSelectedCards([deck[num]]);
		}
	};

	// fetch new card, update players deck and send num of remaining to server
	const fetchCard = async (amount) => {
		const newCards = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${amount}`);
		socket.emit("remaining", newCards.data.remaining);
		return newCards.data.cards;
	};

	// Sets latest card and send it to other players
	// Loads new card from API if remaining > deck.length
	// Sets new cards to players deck
	const handleDeck = async (num) => {
		const latest = {
			image: selectedCards[0].image,
			value: selectedCards[0].value,
			code: selectedCards[0].code,
		};

		socket.emit("latest", latest);

		if (deck.length > 3 || remaining === 0) {
			if (deck.length - selectedCards.length < 3) {
				const amountToFetch = 3 - (deck.length - selectedCards.length);
				const newCards = await fetchCard(amountToFetch);
				const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
				socket.emit("cards", deck.length - amountToFetch);
				setDeck([...newDeck, ...newCards]);
			} else {
				socket.emit("cards", deck.length - selectedCards.length);
				setDeck(deck.filter((card) => selectedCards.indexOf(card) === -1));
			}
		} else if (remaining > 0) {
			const newCards = await fetchCard(selectedCards.length);
			const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
			socket.emit("cards", newCards.length + newDeck.length);
			setDeck([...newCards, ...newDeck]);
		}
		socket.emit("stack", selectedCards);
		setSelectedCards([]);
	};

	// Checks if players move is valid and changes turn / loads new cards after that.
	const gameLogic = (num) => {
		if (turn === true && selectedCards.length > 0) {
			const validMove = checkValidMove(selectedCards[0].value, latestCard.value);

			if (validMove === "ok" && selectedCards.length === 4) {
				handleDeck(num);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
				socket.emit("log", `Kaatuu! ${username} pelasi: ${selectedCards[0].code}`);
			} else if (validMove === "ok") {
				handleDeck(num);
				socket.emit("log", `${username} pelasi ${selectedCards.length} kpl ${selectedCards[0].code}`);
				changeTurn();
			} else if (validMove === "kaatuu") {
				handleDeck(num);
				socket.emit("log", `Kaatuu! ${username} pelasi ${selectedCards[0].code}`);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
			} else if (validMove === "jatka") {
				handleDeck(num);
				socket.emit("log", `${username} pelasi ${selectedCards[0].code}`);
			} else if (validMove === "not ok") {
				setSelectedCards([]);
				alert("You cant play this card!");
			}
		} else {
			alert("ei oo sun vuoro");
		}
	};

	return (
		<Router>
			<div className={`App ${remaining <= 5 ? "red" : null}`}>
				<Route path="/" exact>
					<JoinToGame joinGame={joinGame} handleUsernameChange={handleUsernameChange} />
				</Route>

				<Route path="/game">
					<GameInfo remaining={remaining} gameInfo={gameInfo} latestCard={latestCard} raiseCardStack={raiseCardStack} />
					<Player
						turn={turn}
						gameLogic={gameLogic}
						deck={deck}
						drawRandomCard={drawRandomCard}
						selectCardsToPlay={selectCardsToPlay}
						playCards={selectedCards}
					/>
					<Log log={log} />
				</Route>
			</div>
		</Router>
	);
}

export default App;
