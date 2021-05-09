import { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import Player from "./components/Player";
import GameInfo from "./components/GameInfo";
import JoinToGame from "./components/JoinToGame";
import Log from "./components/Log";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { checkValidMove } from "./utils/utils";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
	updateState,
	updateStack,
	updateLatest,
	updateCardAmount,
	setDeckId,
	updateRemaining,
} from "./reducers/gameReducer";

const socket = io("http://localhost:4000");

function App() {
	const [deck, setDeck] = useState([]);
	const [username, setUsername] = useState();
	const [turn, setTurn] = useState(false);
	const [selectedCards, setSelectedCards] = useState([]);
	const [log, setLog] = useState([]);

	const dispatch = useDispatch();
	const gameState = useSelector((state) => state);

	// Open connection to server to get data
	useEffect(() => {
		socket.on("turn", (turn) => {
			setTurn(turn);
		});

		socket.on("updateGame", (newState) => {
			console.log("GOT NEW STATE", newState);
			dispatch(updateState(newState));
		});

		// Loads 3 cards to hand when game starts and sets deckId
		socket.on("onStart", async (data) => {
			dispatch(setDeckId(data.deckId));
			const newCards = await fetchCard(3);
			setDeck(newCards);
		});

		// Get events from the server
		socket.on("log", (item) => {
			const logg = log;
			logg.unshift(item);
			setLog(logg);
		});
	}, []);

	const joinGame = () => {
		socket.emit("join_game", { username: username, gameState: gameState });
	};

	// Raise cards from stack to players deck
	const raiseCardStack = () => {
		const newDeck = [...deck, ...gameState.stack];
		console.log({ newDeck });
		setDeck(newDeck);
		dispatch(updateStack([]));
		dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
		changeTurn();
		socket.emit("updateGame", gameState);
	};

	const changeTurn = () => {
		socket.emit("turn", { room: gameState.room, playerAmount: gameState.players.length });
	};

	const drawRandomCard = async () => {
		const newCard = await fetchCard(1);
		dispatch(updateCardAmount(deck.length + 1, username));
		socket.emit("updateGame", gameState);
		setDeck([...deck, newCard[0]]);
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (!turn) return;

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
		dispatch(updateRemaining(gameState.remaining - amount));
		const newCards = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${amount}`);
		console.log("NEW REMAINING", newCards.data.remaining);
		return newCards.data.cards;
	};

	// Updates latest card to gameState
	// Sets new cards to players deck
	const handleDeck = async () => {
		const latest = {
			image: selectedCards[0].image,
			value: selectedCards[0].value,
			code: selectedCards[0].code,
		};
		dispatch(updateLatest(latest));
		dispatch(updateStack(selectedCards));

		if (deck.length > 3 && gameState.remaining === 0) {
			dispatch(updateCardAmount(deck.length - selectedCards.length, username));
			setDeck(deck.filter((card) => selectedCards.indexOf(card) === -1));
			//
		} else if (deck.length > 3) {
			const amountToFetch = gameState.remaining > 3 ? 3 - (deck.length - selectedCards.length) : gameState.remaining;
			if (amountToFetch <= 0) {
				dispatch(updateCardAmount(deck.length - selectedCards.length, username));
				setDeck(deck.filter((card) => selectedCards.indexOf(card) === -1));
			} else {
				const newCards = await fetchCard(amountToFetch);
				const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
				dispatch(updateCardAmount(deck.length - amountToFetch, username));
				setDeck([...newDeck, ...newCards]);
			}
		} else if (gameState.remaining > 0) {
			const newCards = await fetchCard(selectedCards.length);
			const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
			dispatch(updateCardAmount(newCards.length + newDeck.length, username));
			setDeck([...newCards, ...newDeck]);
		} else if (gameState.remaining === 0) {
			dispatch(updateCardAmount(deck.length - selectedCards.length, username));
			setDeck(deck.filter((card) => selectedCards.indexOf(card) === -1));
		}

		setSelectedCards([]);
	};

	// Checks if players move is valid and changes turn / loads new cards after that.
	const gameLogic = () => {
		if (turn === true && selectedCards.length > 0) {
			const validMove = checkValidMove(selectedCards[0].value, gameState.latestCard.value);

			if (validMove === "ok" && selectedCards.length === 4) {
				handleDeck();
				dispatch(updateStack([], username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
				socket.emit("log", { text: `Kaatuu! ${username} pelasi: ${selectedCards[0].code}`, room: gameState.room });
			} else if (validMove === "ok") {
				handleDeck();
				socket.emit("log", {
					text: `${username} pelasi ${selectedCards.length} kpl ${selectedCards[0].code}`,
					room: gameState.room,
				});
				changeTurn();
			} else if (validMove === "kaatuu") {
				handleDeck();
				socket.emit("log", { text: `Kaatuu! ${username} pelasi ${selectedCards[0].code}`, room: gameState.room });
				dispatch(updateStack([], username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
			} else if (validMove === "jatka") {
				handleDeck();
				socket.emit("log", { text: `${username} pelasi ${selectedCards[0].code}`, room: gameState.room });
			} else if (validMove === "not ok") {
				setSelectedCards([]);
				alert("You cant play this card!");
			}
			console.log("SEND STATE", gameState);
			socket.emit("updateGame", gameState);
		} else {
			alert("Not your turn");
		}
	};

	const theme = {
		color: "rgb(60, 60, 60)",
	};

	return (
		<Router>
			<ThemeProvider theme={theme}>
				<div className={`App ${gameState.remaining <= 5 ? "red" : null}`}>
					<Route path="/" exact>
						<JoinToGame joinGame={joinGame} setUsername={setUsername} username={username} />
					</Route>

					<Route path="/game">
						<GameInfo raiseCardStack={raiseCardStack} />
						<Player
							turn={turn}
							gameLogic={gameLogic}
							deck={deck}
							drawRandomCard={drawRandomCard}
							selectCardsToPlay={selectCardsToPlay}
							playCards={selectedCards}
						/>
						<Log log={log} room={gameState.room} />
					</Route>
				</div>
			</ThemeProvider>
		</Router>
	);
}

export default App;
