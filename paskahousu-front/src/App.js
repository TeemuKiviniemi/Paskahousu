import { useState, useEffect } from "react";
import Player from "./components/Player";
import OtherPlayers from "./components/OtherPlayers";
import SetGame from "./components/SetGame";
import Log from "./components/Log";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";

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
	const [name, setName] = useState();
	const [gameInfo, setGameInfo] = useState([]);
	const [stack, setStack] = useState([]);
	const [turn, setTurn] = useState(false);
	const [playCards, setPlayCards] = useState([]);
	const [log, setLog] = useState([]);

	// Join game and open connection to server to get data
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
		socket.emit("join_game", name);
	};

	const handleChange = (e) => {
		setName(e.target.value);
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

	// Change card value from text to int
	const returnInt = (text) => {
		if (text === "QUEEN") {
			return 11;
		} else if (text === "KING") {
			return 12;
		} else if (text === "JACK") {
			return 11;
		} else if (text === "ACE") {
			return 1;
		} else {
			return parseInt(text);
		}
	};

	// Checks if players card can be played
	const checkValidMove = (card) => {
		const latest = returnInt(latestCard.value);
		card = returnInt(card);

		if (card === 2) {
			return "jatka";
		} else if (latest === 2) {
			if (card === 1 || card === 10) {
				return "kaatuu";
			} else {
				return "ok";
			}
		} else if (card === 1 && latest >= 10) {
			return "kaatuu";
		} else if (card === 10 && latest <= 9) {
			return "kaatuu";
		} else if (card >= 11 && latest >= 7) {
			return "ok";
		} else if (card >= latest) {
			return "ok";
		} else {
			return "not ok";
		}
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (playCards.length > 0) {
			if (playCards.indexOf(deck[num]) !== -1) {
				const cards = playCards.filter((item) => item !== deck[num]);
				console.log(cards);
				setPlayCards(cards);
			} else if (playCards[playCards.length - 1].value === deck[num].value) {
				const cards = [...playCards, deck[num]];
				setPlayCards(cards);
			} else {
				setPlayCards([]);
				alert("Et voi valita eri kortteja pelattavaksi samalla siirrolla");
			}
		} else {
			setPlayCards([deck[num]]);
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
					let cards = [...deck];
					cards.push(data.cards[0]);
					setDeck(cards);
					socket.emit("remaining", data.remaining);
				} else {
					let newDeck = [];
					deck.map((card) => {
						if (playCards.indexOf(card) === -1) {
							newDeck.push(card);
						}
					});

					setDeck([...newDeck, ...data.cards]);
					socket.emit("remaining", data.remaining);
				}
			});
	};

	// Sets latest card and send it to other players
	// Loads new card from API if remaining > deck.lenght
	// Sets new cards to players deck
	const setCard = (num) => {
		const latest = {
			image: playCards[0].image,
			value: playCards[0].value,
			code: playCards[0].code,
		};

		socket.emit("latest", latest);

		if (deck.length > 3 || remaining === 0) {
			if (deck.length - playCards.length < 3) {
				const amountToFetch = 3 - (deck.length - playCards.length);
				fetchCard(amountToFetch, num);
				socket.emit("cards", deck.length - 1);
				socket.emit("stack", playCards);
			} else {
				let newDeck = [];

				deck.map((card) => {
					if (playCards.indexOf(card) === -1) {
						newDeck.push(card);
					}
				});
				setDeck(newDeck);
				socket.emit("cards", deck.length - 1);
				socket.emit("stack", playCards);
			}
		} else if (remaining > 0) {
			fetchCard(playCards.length, num);
			socket.emit("cards", deck.length);
			socket.emit("stack", playCards);
		}
	};

	const loadNewCard = (num) => {
		if (turn === true && playCards.length > 0) {
			const valid = checkValidMove(playCards[0].value);

			if (valid === "ok" && playCards.length === 4) {
				setCard(num);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
				socket.emit("log", `Kaatuu! ${name} pelasi: ${playCards[0].code}`);
				setPlayCards([]);
			} else if (valid === "ok") {
				setCard(num);
				socket.emit("log", `${name} pelasi ${playCards.length} kpl ${playCards[0].code}`);
				changeTurn();
				setPlayCards([]);
			} else if (valid === "kaatuu") {
				setCard(num);
				socket.emit("log", `Kaatuu! ${name} pelasi ${playCards[0].code}`);
				socket.emit("stack", "empty");
				socket.emit("latest", { image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 });
				setPlayCards([]);
			} else if (valid === "jatka") {
				setCard(num);
				socket.emit("log", `${name} pelasi ${playCards[0].code}`);
				setPlayCards([]);
			} else if (valid === "not ok") {
				setPlayCards([]);
				alert("You cant play this card!");
			}
		} else {
			alert("ei oo sun vuoro");
		}
	};

	// try random card from the pack
	const randomCards = () => {
		fetchCard(1, "random");
	};

	return (
		<Router>
			<div className={`App ${remaining <= 5 ? "red" : null}`}>
				<Route path="/" exact>
					<SetGame joinGame={joinGame} handleChange={handleChange} />
				</Route>

				<Route path="/game">
					{/* <div style={{ position: "absolute", top: 10 }}>	
						<button onClick={() => fetchCard(3, "all")}>fetch card</button>
						<button onClick={() => suffleDeck()}>new deck</button>
						<button onClick={() => console.log(playCards)}>Show stack</button>
					</div > */}

					<h2>Cards remaining: {remaining}</h2>
					<div className="container" on>
						<OtherPlayers gameInfo={gameInfo} />
						<div className="stack-and-latest">
							<img className="latest-img" src={latestCard.image} alt="" onClick={() => raiseCard()} />
						</div>
					</div>

					<div className="players">
						<Player
							turn={turn}
							loadNewCard={loadNewCard}
							deck={deck}
							fetchCard={fetchCard}
							selectCardsToPlay={selectCardsToPlay}
							playCards={playCards}
						/>
					</div>
					<Log log={log} />
				</Route>
			</div>
		</Router>
	);
}

export default App;
