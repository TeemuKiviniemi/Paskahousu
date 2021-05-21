import { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import Player from "./components/Player";
import GameInfo from "./components/GameInfo";
import JoinToGame from "./components/JoinToGame";
import Log from "./components/Log";
import LightSwitch from "./components/LightSwicht";
import { lightTheme, darkTheme } from "./Theme";
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
import { setTurn, setSelectedCards, setDeck } from "./reducers/playerReducer";

const socket = io("http://localhost:4000");

const AppFrame = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 25px;
	min-height: 100vh;
	background-color: ${(props) => props.theme.backgroundColor};
	color: ${(props) => props.theme.color};
	transition: all 500ms;
`;

function App() {
	const [theme, setTheme] = useState(true);
	const [log, setLog] = useState([]);

	const dispatch = useDispatch();
	const gameState = useSelector((state) => state.game);
	const playerState = useSelector((state) => state.player);

	// Open connection to server to get data
	useEffect(() => {
		socket.on("turn", (turn) => {
			dispatch(setTurn(turn));
		});

		socket.on("updateGame", (newState) => {
			dispatch(updateState(newState));
		});

		// Loads 3 cards to hand when game starts and sets deckId
		socket.on("onStart", async (data) => {
			dispatch(setDeckId(data.deckId));
			const newCards = await fetchCard(3);
			dispatch(setDeck(newCards));
		});

		// Get events from the server
		socket.on("log", (item) => {
			const logg = log;
			logg.unshift(item);
			setLog(logg);
		});
	}, []);

	const joinGame = () => {
		socket.emit("join_game", { username: playerState.username, gameState: gameState });
	};

	// Raise cards from stack to players deck
	const raiseCardStack = () => {
		const newDeck = [...playerState.deck, ...gameState.stack];
		dispatch(updateCardAmount(newDeck.length, playerState.username));
		dispatch(setDeck(newDeck));
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
		dispatch(updateCardAmount(playerState.deck.length + 1, playerState.username));
		socket.emit("updateGame", gameState);
		dispatch(setDeck([...playerState.deck, newCard[0]]));
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (!playerState.turn) return;

		// if selected cards value is not same as previous, this will set selected cards to empty
		if (playerState.selectedCards.length > 0 && playerState.selectedCards[0].value !== playerState.deck[num].value) {
			dispatch(setSelectedCards(null));
			alert("Et voi valita eri kortteja pelattavaksi samalla siirrolla");
		} else {
			dispatch(setSelectedCards(playerState.deck[num]));
		}
	};

	// fetch new card, update players deck and send num of remaining to server
	const fetchCard = async (amount) => {
		dispatch(updateRemaining(gameState.remaining - amount));
		const newCards = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${amount}`);
		return newCards.data.cards;
	};

	// Updates latest card to gameState
	// Sets new cards to players deck
	const handleDeck = async () => {
		const latest = {
			image: playerState.selectedCards[0].image,
			value: playerState.selectedCards[0].value,
			code: playerState.selectedCards[0].code,
		};
		dispatch(updateLatest(latest));
		dispatch(updateStack(playerState.selectedCards));

		if (playerState.deck.length > 3 && gameState.remaining === 0) {
			dispatch(updateCardAmount(playerState.deck.length - playerState.selectedCards.length, playerState.username));
			dispatch(setDeck(playerState.deck.filter((card) => playerState.selectedCards.indexOf(card) === -1)));
		} else if (playerState.deck.length > 3) {
			const amountToFetch =
				gameState.remaining > 3
					? 3 - (playerState.deck.length - playerState.selectedCards.length)
					: gameState.remaining;
			if (amountToFetch <= 0) {
				dispatch(updateCardAmount(playerState.deck.length - playerState.selectedCards.length, playerState.username));
				dispatch(setDeck(playerState.deck.filter((card) => playerState.selectedCards.indexOf(card) === -1)));
			} else {
				const newCards = await fetchCard(amountToFetch);
				const newDeck = playerState.deck.filter((card) => playerState.selectedCards.indexOf(card) === -1);
				dispatch(updateCardAmount(playerState.deck.length - amountToFetch, playerState.username));
				dispatch(setDeck([...newDeck, ...newCards]));
			}
		} else if (gameState.remaining > 0) {
			const newCards = await fetchCard(playerState.selectedCards.length);
			const newDeck = playerState.deck.filter((card) => playerState.selectedCards.indexOf(card) === -1);
			dispatch(updateCardAmount(newCards.length + newDeck.length, playerState.username));
			dispatch(setDeck([...newCards, ...newDeck]));
		} else if (gameState.remaining === 0) {
			dispatch(updateCardAmount(playerState.deck.length - playerState.selectedCards.length, playerState.username));
			dispatch(setDeck(playerState.deck.filter((card) => playerState.selectedCards.indexOf(card) === -1)));
		}

		dispatch(setSelectedCards(null));
	};

	// Checks if players move is valid and changes turn / loads new cards after that.
	const gameLogic = () => {
		if (playerState.turn === true && playerState.selectedCards.length > 0) {
			const validMove = checkValidMove(playerState.selectedCards[0].value, gameState.latestCard.value);

			if (validMove === "ok" && playerState.selectedCards.length === 4) {
				handleDeck();
				dispatch(updateStack([], playerState.username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
				socket.emit("log", {
					text: `Kaatuu! ${playerState.username} pelasi: ${playerState.selectedCards[0].code}`,
					room: gameState.room,
				});
			} else if (validMove === "ok") {
				handleDeck();
				socket.emit("log", {
					text: `${playerState.username} pelasi ${playerState.selectedCards.length} kpl ${playerState.selectedCards[0].code}`,
					room: gameState.room,
				});
				changeTurn();
			} else if (validMove === "kaatuu") {
				handleDeck();
				socket.emit("log", {
					text: `Kaatuu! ${playerState.username} pelasi ${playerState.selectedCards[0].code}`,
					room: gameState.room,
				});
				dispatch(updateStack([], playerState.username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
			} else if (validMove === "jatka") {
				handleDeck();
				socket.emit("log", {
					text: `${playerState.username} pelasi ${playerState.selectedCards[0].code}`,
					room: gameState.room,
				});
			} else if (validMove === "not ok") {
				dispatch(setSelectedCards(null));
				alert("You cant play this card!");
			}

			socket.emit("updateGame", gameState);
		} else {
			alert("Not your turn");
		}
	};

	return (
		<Router>
			<ThemeProvider theme={theme ? lightTheme : darkTheme}>
				<AppFrame>
					<Route path="/" exact>
						<JoinToGame joinGame={joinGame} />
					</Route>

					<Route path="/game">
						<GameInfo raiseCardStack={raiseCardStack} turn={playerState.turn} />
						<Player
							turn={playerState.turn}
							gameLogic={gameLogic}
							deck={playerState.deck}
							drawRandomCard={drawRandomCard}
							selectCardsToPlay={selectCardsToPlay}
						/>
						<Log log={log} room={gameState.room} />
						<LightSwitch theme={theme} setTheme={setTheme} />
					</Route>
				</AppFrame>
			</ThemeProvider>
		</Router>
	);
}

export default App;
