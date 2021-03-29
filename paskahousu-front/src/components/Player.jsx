import Hand from "./Hand";

function Player({ deck, loadNewCard, turn, fetchCard, selectCardsToPlay, playCards }) {
	return (
		<div className="player-frame">
			{/* <div>Player {id}</div> */}
			<Hand turn={turn} selectCardsToPlay={selectCardsToPlay} deck={deck} playCards={playCards} />
			<button onClick={() => fetchCard(1, "random")}>Random card</button>
			<button onClick={() => loadNewCard()}> Play cards </button>
		</div>
	);
}

export default Player;
