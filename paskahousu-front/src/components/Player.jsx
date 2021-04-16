import Hand from "./Hand";
import styled from "styled-components";

const PlayerFrame = styled.div``;

const Button = styled.button`
	color: ${(props) => props.theme.color};
	padding: 6px 10px;
`;

function Player({ deck, gameLogic, turn, drawRandomCard, selectCardsToPlay, playCards }) {
	return (
		<div className="player-frame">
			<Hand turn={turn} selectCardsToPlay={selectCardsToPlay} deck={deck} playCards={playCards} />
			<Button onClick={() => drawRandomCard(1)}>Random</Button>
			<Button onClick={() => gameLogic()}> Play cards </Button>
		</div>
	);
}

export default Player;
