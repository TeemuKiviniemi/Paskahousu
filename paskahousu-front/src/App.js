import { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import Game from "./components/Game";
import JoinToGame from "./components/JoinToGame";
import LightSwitch from "./components/LightSwicht";
import StartNewGame from "./components/StartNewGame";
import { lightTheme, darkTheme } from "./Theme";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateState, setDeckId, updateRemaining } from "./reducers/gameReducer";
import { setTurn, setDeck } from "./reducers/playerReducer";
import { addEvent } from "./reducers/logReducer";

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
	const [winner, setWinner] = useState(null);
	const [started, setStarted] = useState(false);

	const dispatch = useDispatch();
	const gameState = useSelector((state) => state.game);
	const player = useSelector((state) => state.player);

	// set theme to dark if user device prefers it
	useEffect(() => {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setTheme(!theme);
		}
	}, []);

	// Open connection to server to get data
	useEffect(() => {
		socket.on("turn", (turn) => {
			dispatch(setTurn(turn));
		});

		socket.on("updateGame", (newState) => {
			dispatch(updateState(newState));
		});

		// Loads 3 cards to hand when game starts and sets deckId
		socket.on("onStart", async (deckId) => {
			dispatch(setDeckId(deckId));
			try {
				const newCards = await fetchCard(3);
				dispatch(setDeck(newCards));
			} catch (err) {
				console.log(err);
			}
		});

		socket.on("start_game", (start) => {
			setStarted(true);
		});

		// Get events from the server
		socket.on("log", (item) => {
			dispatch(addEvent(item));
		});

		socket.on("winner", (name) => {
			setWinner(name);
		});

		socket.on("startNew", (startState) => {
			setWinner(null);
			dispatch(updateState(startState));
			startNewGame();
			dispatch(addEvent("NEW GAME HAS STARTED"));
		});
	}, []);

	const joinGame = () => {
		socket.emit("join_game", { username: player.username, gameState: gameState });
	};

	// Host (first in room) can start game
	const startGame = () => {
		socket.emit("start_game", gameState.room);
	};

	// fetch new card, update players deck and send num of remaining to server
	const fetchCard = async (amount) => {
		try {
			dispatch(updateRemaining(gameState.remaining - amount));
			const newCards = await axios.get(`http://localhost:4000/card/${gameState.deckId}/${amount}`);
			console.log({ newCards });
			return newCards.data.cards;
		} catch (err) {
			dispatch(updateRemaining(gameState.remaining + amount));
			throw new Error("Failed to load new card");
		}
	};

	// this will be called on -> socket.on("startNew")
	const startNewGame = async () => {
		try {
			const newCards = await axios.get(`http://localhost:4000/card/${gameState.deckId}/3`);
			console.log(newCards.data.remaining);
			dispatch(setDeck(newCards.data.cards));
		} catch (err) {
			console.log(err);
		}
	};

	const startNew = () => {
		socket.emit("startNew", gameState);
	};

	return (
		<Router>
			<ThemeProvider theme={theme ? lightTheme : darkTheme}>
				<AppFrame>
					{winner && <StartNewGame winner={winner} startNew={startNew} />}
					<LightSwitch theme={theme} setTheme={setTheme} />
					<Route path="/" exact>
						{started ? (
							<Redirect to={`/game/${gameState.deckId}`} />
						) : (
							<JoinToGame joinGame={joinGame} startGame={startGame} />
						)}
					</Route>
					<Route path={`/game/${gameState.deckId}`}>
						<Game socket={socket} fetchCard={fetchCard} />
					</Route>
				</AppFrame>
			</ThemeProvider>
		</Router>
	);
}

export default App;
