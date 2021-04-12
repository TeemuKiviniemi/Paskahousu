import { useState, useEffect } from "react";
import Player from "./components/Player";
import GameInfo from "./components/GameInfo";
import JoinToGame from "./components/JoinToGame";
import Log from "./components/Log";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { checkValidMove } from "./utils/utils";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateState, updateStack, updateLatest, updateCardAmount, setDeckId } from "./reducers/gameReducer";

const socket = io("http://localhost:4000");

function App() {
	// const [deckId, setDeckId] = useState("2r1mqhamqo49");
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
			console.log("TURN", turn);
			setTurn(turn);
		});

		socket.on("updateGame", (newState) => {
			dispatch(updateState(newState));
		});

		// If start is true -> loads new deck when joining to game.
		// If false -> only loads cards to self when joining
		socket.on("onStart", async (data) => {
			console.log(data);
			dispatch(setDeckId(data.deckId));

			if (data.startGame === true) {
				console.log("HERE");
				const newCards = await fetchCard(3);
				console.log(newCards);
				setDeck(newCards);
			} else {
				console.log("HERE2");
				const newCards = await fetchCard(3);
				setDeck(newCards);
			}
		});

		// Get events from the server
		socket.on("log", (item) => {
			setLog([...log, item]);
		});
	}, []);

	const joinGame = () => {
		console.log(gameState.room);
		socket.emit("join_game", { username: username, gameState: gameState });
	};

	// Raise cards from stack to players deck
	const raiseCardStack = () => {
		socket.emit("cards", deck.length + gameState.stack.length);
		setDeck([...deck, ...gameState.stack]);
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
		try {
			const newCards = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${amount}`);
			return newCards.data.cards;
		} catch (error) {
			console.log("ERROR!", error);
			return [];
		}
	};

	// Sets latest card and send it to other players
	// Loads new card from API if remaining > deck.length
	// Sets new cards to players deck
	const handleDeck = async () => {
		const latest = {
			image: selectedCards[0].image,
			value: selectedCards[0].value,
			code: selectedCards[0].code,
		};
		dispatch(updateLatest(latest));

		if (deck.length > 3 || gameState.remaining === 0) {
			if (deck.length - selectedCards.length < 3) {
				const amountToFetch = 3 - (deck.length - selectedCards.length);
				const newCards = await fetchCard(amountToFetch);
				const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
				dispatch(updateCardAmount(deck.length - amountToFetch, username));
				setDeck([...newDeck, ...newCards]);
			} else {
				dispatch(updateCardAmount(deck.length - selectedCards.length, username));
				setDeck(deck.filter((card) => selectedCards.indexOf(card) === -1));
			}
		} else if (gameState.remaining > 0) {
			const newCards = await fetchCard(selectedCards.length);
			const newDeck = deck.filter((card) => selectedCards.indexOf(card) === -1);
			dispatch(updateCardAmount(newCards.length + newDeck.length, username));
			setDeck([...newCards, ...newDeck]);
		}

		dispatch(updateStack(selectedCards));
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
			socket.emit("updateGame", gameState);
		} else {
			alert("ei oo sun vuoro");
		}
	};

	return (
		<Router>
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
					<Log log={log} />
				</Route>
			</div>
		</Router>
	);
}

export default App;
