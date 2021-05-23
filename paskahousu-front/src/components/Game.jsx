import GameInfo from "./GameInfo";
import Player from "./Player";
import Log from "./Log";
import { checkValidMove } from "../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import { updateStack, updateLatest, updateCardAmount } from "../reducers/gameReducer";
import { setSelectedCards, setDeck } from "../reducers/playerReducer";

const Game = ({ socket, fetchCard, log }) => {
	const dispatch = useDispatch();
	const gameState = useSelector((state) => state.game);
	const player = useSelector((state) => state.player);

	const changeTurn = () => {
		socket.emit("turn", { room: gameState.room, playerAmount: gameState.players.length });
	};

	// Raise cards from stack to players deck
	const raiseCardStack = () => {
		const newDeck = [...player.deck, ...gameState.stack];
		dispatch(updateCardAmount(newDeck.length, player.username));
		dispatch(setDeck(newDeck));
		dispatch(updateStack([]));
		dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
		changeTurn();
		socket.emit("updateGame", gameState);
	};

	const drawRandomCard = async () => {
		try {
			const newCard = await fetchCard(1);
			dispatch(updateCardAmount(player.deck.length + 1, player.username));
			dispatch(setDeck([...player.deck, newCard[0]]));
			socket.emit("updateGame", gameState);
		} catch (err) {
			console.log(err);
		}
	};

	// Select multiple cards to play next
	// These cards need to have same value
	const selectCardsToPlay = (num) => {
		if (!player.turn) return;

		// if selected cards value is not same as previous, this will set selected cards to empty
		if (player.selectedCards.length > 0 && player.selectedCards[0].value !== player.deck[num].value) {
			dispatch(setSelectedCards(null));
			alert("Et voi valita eri kortteja pelattavaksi samalla siirrolla");
		} else {
			dispatch(setSelectedCards(player.deck[num]));
		}
	};

	// Updates latest card to gameState
	// Sets new cards to players deck
	const handleDeck = async () => {
		const latest = {
			image: player.selectedCards[0].image,
			value: player.selectedCards[0].value,
			code: player.selectedCards[0].code,
		};
		dispatch(updateLatest(latest));
		dispatch(updateStack(player.selectedCards));

		if (player.deck.length > 3 && gameState.remaining === 0) {
			dispatch(updateCardAmount(player.deck.length - player.selectedCards.length, player.username));
			dispatch(setDeck(player.deck.filter((card) => player.selectedCards.indexOf(card) === -1)));
		} else if (player.deck.length > 3) {
			const amountToFetch =
				gameState.remaining > 3 ? 3 - (player.deck.length - player.selectedCards.length) : gameState.remaining;
			if (amountToFetch <= 0) {
				dispatch(updateCardAmount(player.deck.length - player.selectedCards.length, player.username));
				dispatch(setDeck(player.deck.filter((card) => player.selectedCards.indexOf(card) === -1)));
			} else {
				try {
					const newCards = await fetchCard(amountToFetch);
					const newDeck = player.deck.filter((card) => player.selectedCards.indexOf(card) === -1);
					dispatch(updateCardAmount(player.deck.length - amountToFetch, player.username));
					dispatch(setDeck([...newDeck, ...newCards]));
				} catch (err) {
					console.log(err);
				}
			}
		} else if (gameState.remaining > 0) {
			try {
				const newCards = await fetchCard(player.selectedCards.length);
				const newDeck = player.deck.filter((card) => player.selectedCards.indexOf(card) === -1);
				dispatch(updateCardAmount(newCards.length + newDeck.length, player.username));
				dispatch(setDeck([...newCards, ...newDeck]));
			} catch (err) {
				console.log(err);
			}
		} else if (gameState.remaining === 0) {
			dispatch(updateCardAmount(player.deck.length - player.selectedCards.length, player.username));
			dispatch(setDeck(player.deck.filter((card) => player.selectedCards.indexOf(card) === -1)));
		}

		dispatch(setSelectedCards(null));
	};

	// Checks if players move is valid and changes turn / loads new cards after that.
	const gameLogic = () => {
		if (player.turn === true && player.selectedCards.length > 0) {
			const validMove = checkValidMove(player.selectedCards[0].value, gameState.latestCard.value);

			if (validMove === "ok" && player.selectedCards.length === 4) {
				handleDeck();
				dispatch(updateStack([], player.username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
				socket.emit("log", {
					text: `Kaatuu! ${player.username} pelasi: ${player.selectedCards[0].code}`,
					room: gameState.room,
				});
			} else if (validMove === "ok") {
				handleDeck();
				socket.emit("log", {
					text: `${player.username} pelasi ${player.selectedCards.length} kpl ${player.selectedCards[0].code}`,
					room: gameState.room,
				});
				changeTurn();
			} else if (validMove === "kaatuu") {
				handleDeck();
				socket.emit("log", {
					text: `Kaatuu! ${player.username} pelasi ${player.selectedCards[0].code}`,
					room: gameState.room,
				});
				dispatch(updateStack([], player.username));
				dispatch(updateLatest({ image: "https://deckofcardsapi.com/static/img/X2.png", value: 0, code: 0 }));
			} else if (validMove === "jatka") {
				handleDeck();
				socket.emit("log", {
					text: `${player.username} pelasi ${player.selectedCards[0].code}`,
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
		<>
			<GameInfo raiseCardStack={raiseCardStack} />
			<Player gameLogic={gameLogic} drawRandomCard={drawRandomCard} selectCardsToPlay={selectCardsToPlay} />
			<Log log={log} room={gameState.room} />
		</>
	);
};

export default Game;
