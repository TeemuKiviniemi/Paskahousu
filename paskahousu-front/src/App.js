import { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import Game from "./components/Game";
import JoinToGame from "./components/JoinToGame";
import LightSwitch from "./components/LightSwicht";
import { lightTheme, darkTheme } from "./Theme";
import { io } from "socket.io-client";
import { BrowserRouter as Router, Route } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateState, setDeckId, updateRemaining } from "./reducers/gameReducer";
import { setTurn, setDeck } from "./reducers/playerReducer";

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
	const [winner, setWinner] = useState();

	const dispatch = useDispatch();
	const gameState = useSelector((state) => state.game);
	const player = useSelector((state) => state.player);

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
			try {
				const newCards = await fetchCard(3);
				dispatch(setDeck(newCards));
			} catch (err) {
				console.log(err);
			}
		});

		// Get events from the server
		socket.on("log", (item) => {
			const logg = log;
			logg.unshift(item);
			setLog(logg);
		});

		socket.on("winner", (name) => {
			setWinner(name);
		});
	}, []);

	const joinGame = () => {
		socket.emit("join_game", { username: player.username, gameState: gameState });
	};

	// fetch new card, update players deck and send num of remaining to server
	const fetchCard = async (amount) => {
		try {
			dispatch(updateRemaining(gameState.remaining - amount));
			const newCards = await axios.get(`https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${amount}`);
			console.log(newCards.data.remaining);
			return newCards.data.cards;
		} catch (err) {
			dispatch(updateRemaining(gameState.remaining + amount));
			throw new Error("Failed to load new card");
		}
	};

	return (
		<Router>
			<ThemeProvider theme={theme ? lightTheme : darkTheme}>
				<AppFrame>
					{winner && <h1>{`Winner is ${winner}!`}</h1>}
					<LightSwitch theme={theme} setTheme={setTheme} />
					<Route path="/" exact>
						<JoinToGame joinGame={joinGame} />
					</Route>
					<Route path="/game">
						<Game socket={socket} fetchCard={fetchCard} log={log} />
					</Route>
				</AppFrame>
			</ThemeProvider>
		</Router>
	);
}

export default App;
