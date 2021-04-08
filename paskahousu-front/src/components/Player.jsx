import Hand from "./Hand";

function Player({ deck, gameLogic, turn, drawRandomCard, selectCardsToPlay, playCards }) {
	return (
		<div className="player-frame">
			<Hand turn={turn} selectCardsToPlay={selectCardsToPlay} deck={deck} playCards={playCards} />
			<button onClick={() => drawRandomCard(1)}>Random card</button>
			<button onClick={() => gameLogic()}> Play cards </button>
		</div>
	);
}

export default Player;
