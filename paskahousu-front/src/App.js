import { useState, useEffect } from "react";
import Player from "./components/Player";
import GameInfo from "./components/GameInfo";
import JoinToGame from "./components/JoinToGame";
import Log from "./components/Log";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { checkValidMove } from "./utils/utils";

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

		// If start is true, loads new deck to player when joining to game.
		// If false player only loads cards to self when joining
		socket.on("onStart", (start) => {
			if (start === true) {
				suffleDeck();
			} else {
				fetchCard(3, "all");
			}
		});

		// Get log of games events from the server
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

	// loads new deck and set 3 new cards to player
	const suffleDeck = () => {
		fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`)
			.then((responce) => {
				return responce.json();
			})
			.then((data) => {
				fetchCard(3, "all");
			});
	};

	// Raise cards from stack to players deck
	const raiseCard = () => {
		setDeck([...deck, ...stack]);
		setLatestCard({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
		socket.emit("cards", deck.length + stack.length);
		socket.emit("stack", "empty");
		socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
		changeTurn();
	};

	const changeTurn = () => {
		socket.emit("turn", true);
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (selectedCards.length > 0) {
			if (selectedCards.indexOf(deck[num]) !== -1) {
				const cards = selectedCards.filter((item) => item !== deck[num]);
				console.log(cards);
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
	const fetchCard = (amount, num) => {
		fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${amount}`)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				if (num === "all") {
					setDeck(data.cards);
					socket.emit("remaining", data.remaining);
				} else if (num === "random") {
					setDeck([...deck, data.cards[0]]);
					socket.emit("remaining", data.remaining);
				} else {
					const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
					setDeck([...newDeck, ...data.cards]);
					socket.emit("remaining", data.remaining);
				}
			});
	};

	// Sets latest card and send it to other players
	// Loads new card from API if remaining > deck.length
	// Sets new cards to players deck
	const setCard = (num) => {
		const latest = {
			image: selectedCards[0].image,
			value: selectedCards[0].value,
			code: selectedCards[0].code,
		};

		socket.emit("latest", latest);

		if (deck.length > 3 || remaining === 0) {
			if (deck.length - selectedCards.length < 3) {
				const amountToFetch = 3 - (deck.length - selectedCards.length);
				fetchCard(amountToFetch, num);
				socket.emit("cards", deck.length - 1);
				socket.emit("stack", selectedCards);
			} else {
				const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
				setDeck(newDeck);
				socket.emit("cards", deck.length - 1);
				socket.emit("stack", selectedCards);
			}
		} else if (remaining > 0) {
			fetchCard(selectedCards.length, num);
			socket.emit("cards", deck.length);
			socket.emit("stack", selectedCards);
		}
	};

	const loadNewCard = (num) => {
		if (turn === true && selectedCards.length > 0) {
			const valid = checkValidMove(selectedCards[0].value, latestCard.value);

			if (valid === "ok" && selectedCards.length === 4) {
				setCard(num);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
				socket.emit("log", `Kaatuu! ${username} pelasi: ${selectedCards[0].code}`);
				setSelectedCards([]);
			} else if (valid === "ok") {
				setCard(num);
				socket.emit("log", `${username} pelasi ${selectedCards.length} kpl ${selectedCards[0].code}`);
				changeTurn();
				setSelectedCards([]);
			} else if (valid === "kaatuu") {
				setCard(num);
				socket.emit("log", `Kaatuu! ${username} pelasi ${selectedCards[0].code}`);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
				setSelectedCards([]);
			} else if (valid === "jatka") {
				setCard(num);
				socket.emit("log", `${username} pelasi ${selectedCards[0].code}`);
				setSelectedCards([]);
			} else if (valid === "not ok") {
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
					<GameInfo remaining={remaining} gameInfo={gameInfo} latestCard={latestCard} raiseCard={raiseCard} />
					<Player
						turn={turn}
						loadNewCard={loadNewCard}
						deck={deck}
						fetchCard={fetchCard}
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
