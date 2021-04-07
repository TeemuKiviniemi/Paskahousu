import Hand from "./Hand";

function Player({ deck, gameLogic, turn, fetchCard, selectCardsToPlay, playCards }) {
	return (
		<div className="player-frame">
			<Hand turn={turn} selectCardsToPlay={selectCardsToPlay} deck={deck} playCards={playCards} />
			<button onClick={() => fetchCard(1, "random")}>Random card</button>
			<button onClick={() => gameLogic()}> Play cards </button>
		</div>
	);
}

export default Player;
